import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { SERVER_INSTRUCTIONS } from '../../src/core/server.js';
import { CASES } from './cases.js';
import {
	ACCOUNT,
	API_KEY,
	callTool,
	type CapturedResponse,
	connectHttp,
	type Era,
	type HttpServer,
	INITIALIZE_BODY,
	MODERN_REVISION,
	rawRequest,
	startHttpServer,
} from './harness.js';
import { type MockApi, type RecordedRequest, startMockApi } from './mock-api.js';

const usersCase = CASES.find(({ id }) => id === 'get_account_users')!;
const perRequestHeaders = (account: string) => ({ Authorization: `Bearer ofk_test_${account}`, 'X-Offorte-Account': account });

describe('HTTP, single-account mode', () => {
	let mock: MockApi;
	let server: HttpServer;

	beforeAll(async () => {
		mock = await startMockApi();
		server = await startHttpServer({ OFFORTE_ACCOUNT_NAME: ACCOUNT, OFFORTE_API_KEY: API_KEY, OFFORTE_API_HOST: mock.apiHost });
	});

	afterAll(async () => {
		await server?.stop();
		await mock?.close();
	});

	it.each<Era>(['legacy', 'modern'])('serves a %s-era client without an earlier get_initial_context call', async (era) => {
		const client = await connectHttp(server, { era });

		try {
			expect(client.getNegotiatedProtocolVersion()).toBe(era === 'modern' ? MODERN_REVISION : '2025-11-25');
			expect(client.getInstructions()).toBe(SERVER_INSTRUCTIONS);
			expect((await client.listTools()).tools).toHaveLength(33);

			const users = await callTool(client, mock, usersCase);
			expect(users.result?.isError).toBe(false);
			expect(users.requests).toEqual([expect.objectContaining({ path: `/api/v2/${ACCOUNT}/account/users`, authorization: `Bearer ${API_KEY}` })]);
		} finally {
			await client.close();
		}
	});

	it('uses the env account, also when a request sends another API key', async () => {
		const client = await connectHttp(server, { headers: { Authorization: 'Bearer ofk_test_other' } });

		try {
			const users = await callTool(client, mock, usersCase);
			expect(users.requests[0]).toMatchObject({ path: `/api/v2/${ACCOUNT}/account/users`, authorization: `Bearer ${API_KEY}` });
		} finally {
			await client.close();
		}
	});

	it('answers 400 to a request with X-Offorte-Account', async () => {
		mock.reset();
		const response = await rawRequest(server, '/mcp', { headers: { 'X-Offorte-Account': 'other' }, body: INITIALIZE_BODY });

		expect(response.status).toBe(400);
		expect(response.body).toContain('single-account mode');
		expect(response.headers['cache-control']).toBe('no-store');
		expect(mock.requests).toEqual([]);
	});

	it('marks every /mcp answer no-store and tools/list as private for 5 minutes', async () => {
		const capture: CapturedResponse[] = [];

		for (const era of ['legacy', 'modern'] as const) {
			const client = await connectHttp(server, { era, capture });
			try {
				await client.listTools();
			} finally {
				await client.close();
			}
		}

		const isStream = (response: CapturedResponse) => response.headers.get('content-type')?.includes('text/event-stream') === true;
		expect(capture.some(isStream)).toBe(true);
		for (const response of capture) {
			expect(response.headers.get('cache-control')).toBe(isStream(response) ? 'no-store, no-transform' : 'no-store');
		}
		const toolsList = capture.find((response) => (response.json as { result?: { tools?: unknown } })?.result?.tools);
		expect(toolsList?.json).toMatchObject({ result: { ttlMs: 300_000, cacheScope: 'private' } });

		const notAllowed = await rawRequest(server, '/mcp', { method: 'GET' });
		expect(notAllowed.headers['cache-control']).toBe('no-store');
	});

	it('answers 405 to GET and DELETE on /mcp', async () => {
		expect((await rawRequest(server, '/mcp', { method: 'GET' })).status).toBe(405);
		expect((await rawRequest(server, '/mcp', { method: 'DELETE' })).status).toBe(405);
	});

	it('has no legacy SSE endpoints', async () => {
		expect((await rawRequest(server, '/sse', { method: 'GET' })).status).toBe(404);
		expect((await rawRequest(server, '/messages', { body: INITIALIZE_BODY })).status).toBe(404);
	});

	it('answers /health, /ping, and /ready', async () => {
		const health = await rawRequest(server, '/health', { method: 'GET' });
		expect(health.status).toBe(200);
		expect(health.body).toBe('✓ Ok');
		expect((await rawRequest(server, '/ping', { method: 'GET' })).body).toBe('pong');
		expect((await rawRequest(server, '/ready', { method: 'GET' })).status).toBe(200);
	});

	it('answers CORS for browser pages on localhost only', async () => {
		const preflight = (origin: string) =>
			rawRequest(server, '/mcp', {
				method: 'OPTIONS',
				headers: { Origin: origin, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type, mcp-protocol-version' },
			});

		const local = await preflight('http://localhost:5173');
		expect(local.status).toBe(204);
		expect(local.headers['access-control-allow-origin']).toBe('http://localhost:5173');
		expect(local.headers['access-control-allow-headers']).toContain('Mcp-Protocol-Version');
		expect(local.headers['cache-control']).toBe('no-store');

		const foreign = await preflight('https://attacker.example');
		expect(foreign.status).toBe(403);
		expect(foreign.headers['access-control-allow-origin']).toBeUndefined();
		expect(foreign.headers['cache-control']).toBe('no-store');

		const post = await rawRequest(server, '/mcp', { headers: { Origin: 'http://127.0.0.1:5173' }, body: INITIALIZE_BODY });
		expect(post.status).toBe(200);
		expect(post.headers['access-control-allow-origin']).toBe('http://127.0.0.1:5173');
	});

	it('refuses a non-loopback Origin on a loopback host, and checks no Host', async () => {
		const foreign = await rawRequest(server, '/mcp', { headers: { Origin: 'https://attacker.example' }, body: INITIALIZE_BODY });
		expect(foreign.status).toBe(403);

		const local = await rawRequest(server, '/mcp', { headers: { Origin: `http://localhost:${server.port}` }, body: INITIALIZE_BODY });
		expect(local.status).toBe(200);

		const tunnel = await rawRequest(server, '/mcp', { headers: { Host: 'my-tunnel.example' }, body: INITIALIZE_BODY });
		expect(tunnel.status).toBe(200);
	});
});

describe('HTTP, per-request mode', () => {
	let mock: MockApi;
	let server: HttpServer;

	beforeAll(async () => {
		mock = await startMockApi();
		server = await startHttpServer({ OFFORTE_API_HOST: mock.apiHost });
	});

	afterAll(async () => {
		await server?.stop();
		await mock?.close();
	});

	it.each([
		['no headers', {}],
		['no account', { Authorization: 'Bearer ofk_test_acme' }],
		['no key', { 'X-Offorte-Account': 'acme' }],
		['a key that is not ofk_', { Authorization: 'Bearer abc', 'X-Offorte-Account': 'acme' }],
		['account .', { Authorization: 'Bearer ofk_test_acme', 'X-Offorte-Account': '.' }],
		['account ..', { Authorization: 'Bearer ofk_test_acme', 'X-Offorte-Account': '..' }],
	])('answers 401 with no tools and no API call for %s', async (_name, headers) => {
		mock.reset();
		const body = JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} });
		const response = await rawRequest(server, '/mcp', { headers, body });

		expect(response.status).toBe(401);
		expect(response.headers['www-authenticate']).toBe('Bearer');
		expect(response.headers['cache-control']).toBe('no-store');
		expect(response.body).not.toContain('get_account_users');
		expect(mock.requests).toEqual([]);
	});

	it('keeps the account in one path segment', async () => {
		const account = 'a/b?c=1#d';
		const client = await connectHttp(server, { headers: perRequestHeaders(account) });

		try {
			const users = await callTool(client, mock, usersCase);
			expect(users.requests).toEqual([expect.objectContaining({ path: '/api/v2/a%2Fb%3Fc%3D1%23d/account/users', query: {} })]);
		} finally {
			await client.close();
		}
	});

	it.each<Era>(['legacy', 'modern'])('keeps two %s-era accounts apart in parallel requests', async (era) => {
		const accounts = ['alpha', 'bravo'];
		const clients = await Promise.all(accounts.map((account) => connectHttp(server, { era, headers: perRequestHeaders(account) })));

		mock.reset();
		// Hold every answer until both accounts have a call waiting, so the requests overlap
		let release: () => void = () => {};
		const bothArrived = new Promise<void>((resolve) => (release = resolve));
		const seen = new Set<string>();
		mock.beforeAnswer = async (request: RecordedRequest) => {
			seen.add(request.path.split('/')[3]);
			if (seen.size === accounts.length) {
				release();
			}
			await bothArrived;
		};
		mock.respond = (request) => ({
			body: [{ id: 1, name: request.query.query, date_created: '', price_total: '0', proposal_nr: 1, status: 'open', version_id: 1 }],
		});

		try {
			const calls = Array.from({ length: 10 }, (_, index) => {
				const client = clients[index % 2];
				const marker = `${accounts[index % 2]}-${index}`;
				return client.callTool({ name: 'search_proposals', arguments: { search: marker } }).then((result) => ({ marker, result }));
			});
			const results = await Promise.all(calls);

			for (const { marker, result } of results) {
				expect((result.content as { text: string }[])[0].text).toContain(`"name":"${marker}"`);
			}
			expect(mock.requests).toHaveLength(10);
			for (const request of mock.requests) {
				const account = request.path.split('/')[3];
				expect(request.authorization).toBe(`Bearer ofk_test_${account}`);
				expect(request.query.query.startsWith(`${account}-`)).toBe(true);
			}

			const contexts = await Promise.all(clients.map((client) => client.callTool({ name: 'get_initial_context', arguments: {} })));
			contexts.forEach((context, index) => {
				expect((context.content as { text: string }[])[0].text).toContain(`Name: ${accounts[index]}\n`);
			});

			const anonymous = await rawRequest(server, '/mcp', { body: JSON.stringify({ jsonrpc: '2.0', id: 3, method: 'tools/list', params: {} }) });
			expect(anonymous.status).toBe(401);
		} finally {
			await Promise.all(clients.map((client) => client.close()));
		}
	});
});

describe('HTTP start and shutdown', () => {
	let mock: MockApi;

	beforeAll(async () => {
		mock = await startMockApi();
	});

	afterAll(async () => {
		await mock?.close();
	});

	it('refuses to start with only one credential variable', async () => {
		const server = await startHttpServer({ OFFORTE_API_KEY: API_KEY, OFFORTE_API_HOST: mock.apiHost });

		expect(await server.exited).not.toBe(0);
		expect(server.stderr()).toContain('set both OFFORTE_ACCOUNT_NAME and OFFORTE_API_KEY');
	});

	it('warns that TRANSPORT_TYPE=sse has no /sse endpoint', async () => {
		const server = await startHttpServer({ TRANSPORT_TYPE: 'sse', OFFORTE_API_HOST: mock.apiHost });

		try {
			expect(server.stderr()).toContain('clients must connect to /mcp');
			expect((await rawRequest(server, '/sse', { method: 'GET' })).status).toBe(404);
		} finally {
			await server.stop();
		}
	});

	it('answers CORS for localhost origins only on a non-loopback address, in both credential modes', async () => {
		const server = await startHttpServer({ HOST: '0.0.0.0', OFFORTE_API_HOST: mock.apiHost });

		try {
			const foreign = await rawRequest(server, '/mcp', {
				method: 'OPTIONS',
				headers: { Origin: 'https://client.example', 'Access-Control-Request-Method': 'POST' },
			});
			expect(foreign.headers['access-control-allow-origin']).toBeUndefined();

			const local = await rawRequest(server, '/mcp', {
				method: 'OPTIONS',
				headers: { Origin: 'http://localhost:5173', 'Access-Control-Request-Method': 'POST' },
			});
			expect(local.status).toBe(204);
			expect(local.headers['access-control-allow-origin']).toBe('http://localhost:5173');

			const post = await rawRequest(server, '/mcp', {
				headers: { Origin: 'https://client.example', ...perRequestHeaders('acme') },
				body: INITIALIZE_BODY,
			});
			expect(post.status).toBe(200);
			expect(post.headers['access-control-allow-origin']).toBeUndefined();
		} finally {
			await server.stop();
		}

		const singleAccount = await startHttpServer({
			HOST: '0.0.0.0',
			OFFORTE_ACCOUNT_NAME: ACCOUNT,
			OFFORTE_API_KEY: API_KEY,
			OFFORTE_API_HOST: mock.apiHost,
		});
		try {
			const preflight = await rawRequest(singleAccount, '/mcp', {
				method: 'OPTIONS',
				headers: { Origin: 'https://client.example', 'Access-Control-Request-Method': 'POST' },
			});
			expect(preflight.headers['access-control-allow-origin']).toBeUndefined();
		} finally {
			await singleAccount.stop();
		}
	});

	it('checks Host on /mcp only when ALLOWED_HOSTS is set', async () => {
		const server = await startHttpServer({ ALLOWED_HOSTS: 'mcp.example.com, localhost', OFFORTE_API_HOST: mock.apiHost });

		try {
			const other = await rawRequest(server, '/mcp', { headers: { Host: 'other.example' }, body: INITIALIZE_BODY });
			expect(other.status).toBe(403);

			const allowed = await rawRequest(server, '/mcp', { headers: { Host: 'mcp.example.com', ...perRequestHeaders('acme') }, body: INITIALIZE_BODY });
			expect(allowed.status).toBe(200);

			const health = await rawRequest(server, '/health', { method: 'GET', headers: { Host: 'other.example' } });
			expect(health.status).toBe(200);
		} finally {
			await server.stop();
		}
	});

	it('on SIGTERM: /ready is 503 at once, serves during the drain, finishes running calls, then exits', { timeout: 20_000 }, async () => {
		const server = await startHttpServer({ OFFORTE_ACCOUNT_NAME: ACCOUNT, OFFORTE_API_KEY: API_KEY, OFFORTE_API_HOST: mock.apiHost });
		const client = await connectHttp(server);
		mock.reset();
		mock.queue([{ body: [], delayMs: 7000 }]);

		const slowCall = client.callTool({ name: 'get_account_users', arguments: {} });
		await expect.poll(() => mock.requests.length).toBe(1);

		const sentAt = Date.now();
		server.signal('SIGTERM');

		await expect.poll(async () => (await rawRequest(server, '/ready', { method: 'GET' })).status).toBe(503);

		mock.queue([{ body: [] }]);
		const duringDrain = await connectHttp(server);
		expect((await duringDrain.callTool({ name: 'get_account_users', arguments: {} })).isError).toBeFalsy();
		await duringDrain.close();

		expect((await slowCall).isError).toBeFalsy();
		expect(await server.exited).toBe(0);
		expect(Date.now() - sentAt).toBeLessThan(15_000);
		await client.close();
	});
});
