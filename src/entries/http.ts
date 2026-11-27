import { serve } from '@hono/node-server';
import { hostHeaderValidation, localhostOriginValidation } from '@modelcontextprotocol/hono';
import { type AuthInfo, createMcpHandler, localhostAllowedOrigins, validateOriginHeader } from '@modelcontextprotocol/server';
import { type Context, Hono } from 'hono';
import { cors } from 'hono/cors';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { API_TIMEOUT_MS, createServer } from '../core/server.js';
import type { OfforteCredentials } from '../utils/requests.js';

const LOOPBACK_HOSTS = ['localhost', '127.0.0.1', '::1'];
const ACCOUNT_HEADER = 'X-Offorte-Account';
const BEARER_API_KEY = /^Bearer\s+(ofk_\S+)$/i;

// A load balancer that checks /ready every few seconds stops sending traffic within this delay
const DRAIN_DELAY_MS = 5_000;
// Covers one Offorte API call, so a running single-call write is not cut
const SHUTDOWN_WAIT_MS = API_TIMEOUT_MS;

// FastMCP's CORS headers plus the account header and WWW-Authenticate, so localhost browser clients keep working
const CORS_HEADERS = {
	allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
	allowHeaders: [
		'Content-Type',
		'Authorization',
		'Accept',
		'Mcp-Session-Id',
		'Mcp-Protocol-Version',
		'Last-Event-Id',
		'Mcp-Method',
		'Mcp-Name',
		ACCOUNT_HEADER,
	],
	exposeHeaders: ['Mcp-Session-Id', 'WWW-Authenticate'],
};

const isLoopbackOrigin = (origin: string) => origin !== '' && validateOriginHeader(origin, localhostAllowedOrigins()).ok;

export interface HttpOptions {
	apiHost: string;
	version: string;
	host: string;
	port: number;
	allowedHosts: string[] | undefined;
	/** Set: every request uses this account. Not set: each request sends its own credentials. */
	credentials: OfforteCredentials | undefined;
}

function jsonRpcError(c: Context, status: ContentfulStatusCode, message: string, headers?: Record<string, string>) {
	return c.json({ jsonrpc: '2.0', error: { code: -32000, message }, id: null }, status, headers);
}

function requestCredentials(c: Context): OfforteCredentials | undefined {
	const apiKey = BEARER_API_KEY.exec(c.req.header('Authorization') ?? '')?.[1];
	const accountName = c.req.header(ACCOUNT_HEADER);

	if (!apiKey || !accountName || accountName === '.' || accountName === '..') {
		return undefined;
	}
	return { accountName, apiKey };
}

// The SDK hands authInfo to the server factory of the same request, and to no other request
function toAuthInfo({ accountName, apiKey }: OfforteCredentials): AuthInfo {
	return { token: apiKey, clientId: 'offorte-mcp-server', scopes: [], extra: { accountName } };
}

function fromAuthInfo(authInfo: AuthInfo | undefined): OfforteCredentials {
	const accountName = authInfo?.extra?.accountName;

	if (!authInfo || typeof accountName !== 'string') {
		throw new Error('The request has no Offorte credentials');
	}
	return { accountName, apiKey: authInfo.token };
}

export function createHttpApp({ apiHost, version, host, allowedHosts, credentials }: HttpOptions) {
	const state = { shuttingDown: false };
	const handler = createMcpHandler(({ authInfo }) => createServer({ credentials: fromAuthInfo(authInfo), apiHost, version, guard: false }), {
		onerror: (error) => console.error(error),
	});

	const app = new Hono();
	const isLoopbackHost = LOOPBACK_HOSTS.includes(host);

	// No shared cache may keep an answer: it holds the data of one account.
	// Keep no-transform on streamed answers, so a proxy does not buffer the stream.
	app.use('/mcp', async (c, next) => {
		await next();
		const noTransform = c.res.headers.get('Cache-Control')?.includes('no-transform') ? ', no-transform' : '';
		c.res.headers.set('Cache-Control', `no-store${noTransform}`);
	});
	if (isLoopbackHost) {
		app.use('/mcp', localhostOriginValidation());
	}
	if (allowedHosts) {
		app.use('/mcp', hostHeaderValidation(allowedHosts));
	}

	// After the /mcp checks, so a refused preflight gets 403 too
	app.use('*', cors({ ...CORS_HEADERS, origin: (origin) => (isLoopbackOrigin(origin) ? origin : null) }));

	app.get('/health', (c) => c.text('✓ Ok'));
	app.get('/ping', (c) => c.text('pong'));
	app.get('/ready', (c) => (state.shuttingDown ? c.json({ status: 'shutting_down' }, 503) : c.json({ status: 'ready' })));

	app.on(['GET', 'DELETE'], '/mcp', (c) => jsonRpcError(c, 405, 'Method not allowed.', { Allow: 'POST' }));

	app.post('/mcp', (c) => {
		if (credentials) {
			if (c.req.header(ACCOUNT_HEADER) !== undefined) {
				return jsonRpcError(c, 400, `This server runs in single-account mode. Remove the ${ACCOUNT_HEADER} header.`);
			}
			return handler.fetch(c.req.raw, { authInfo: toAuthInfo(credentials) });
		}

		const perRequest = requestCredentials(c);

		if (!perRequest) {
			return jsonRpcError(c, 401, `Send Authorization: Bearer <Offorte API key> and ${ACCOUNT_HEADER}: <account name>.`, {
				'WWW-Authenticate': 'Bearer',
			});
		}
		return handler.fetch(c.req.raw, { authInfo: toAuthInfo(perRequest) });
	});

	return { app, state };
}

export function startHttp(options: HttpOptions) {
	const { app, state } = createHttpApp(options);
	const mode = options.credentials ? 'one account from the environment' : 'credentials from each request';

	const server = serve({ fetch: app.fetch, hostname: options.host, port: options.port }, ({ port }) => {
		console.error(`Offorte MCP server is running at http://${options.host}:${port}/mcp (${mode})`);
	});

	process.once('SIGTERM', () => {
		state.shuttingDown = true;

		setTimeout(() => {
			server.close(() => process.exit(0));
			setTimeout(() => process.exit(0), SHUTDOWN_WAIT_MS);
		}, DRAIN_DELAY_MS);
	});
}
