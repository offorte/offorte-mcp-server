import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { type IncomingHttpHeaders, request as httpRequest } from 'node:http';
import { type AddressInfo, createServer as createNetServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import type { ContractCase } from './cases.js';
import type { MockApi, RecordedRequest } from './mock-api.js';

export const ACCOUNT = 'acme';
export const API_KEY = 'ofk_test_acme';

export const REPO_ROOT = resolve(import.meta.dirname, '../..');
export const BUILT_SERVER = join(REPO_ROOT, 'dist/server.js');

export const serverPath = () => process.env.CONTRACT_SERVER ?? BUILT_SERVER;

/**
 * An empty working folder for a spawned server. The server loads `.env` from its working folder,
 * so a server started in the repository could pick up real credentials.
 */
export const emptyWorkdir = () => mkdtempSync(join(tmpdir(), 'offorte-mcp-test-'));

export interface ToolOutcome {
	requests: Omit<RecordedRequest, never>[];
	result?: {
		text: string[];
		isError: boolean;
		structuredContent?: unknown;
	};
	protocolError?: { code: number; message: string };
}

export type Era = 'legacy' | 'modern';

export const MODERN_REVISION = '2026-07-28';

export const clientOptions = (era: Era = 'legacy') => (era === 'modern' ? { versionNegotiation: { mode: { pin: MODERN_REVISION } } } : undefined);

export interface StdioOptions {
	env?: Record<string, string>;
	/** legacy: the 2025-11-25 initialize handshake (the client default). modern: revision 2026-07-28. */
	era?: Era;
}

export async function connectStdio(mock: MockApi, { env = {}, era }: StdioOptions = {}) {
	const transport = new StdioClientTransport({
		command: process.execPath,
		args: [serverPath()],
		cwd: emptyWorkdir(),
		env: {
			PATH: process.env.PATH ?? '',
			OFFORTE_ACCOUNT_NAME: ACCOUNT,
			OFFORTE_API_KEY: API_KEY,
			OFFORTE_API_HOST: mock.apiHost,
			...env,
		},
		stderr: 'pipe',
	});
	const client = new Client({ name: 'contract-test', version: '1.0.0' }, clientOptions(era));
	await client.connect(transport);
	return client;
}

export function normalize<T>(value: T, mock: MockApi): T {
	const text = JSON.stringify(value)
		.replaceAll(mock.origin, 'http://mock')
		.replace(/today: \d{1,2}\/\d{1,2}\/\d{4}/g, 'today: <date>');
	return JSON.parse(text) as T;
}

export async function callTool(client: Client, mock: MockApi, testCase: ContractCase): Promise<ToolOutcome> {
	mock.reset();
	mock.queue(testCase.answers ?? []);
	const outcome: ToolOutcome = { requests: [] };

	try {
		const result = await client.callTool({ name: testCase.tool, arguments: testCase.args });
		const content = (result.content ?? []) as { type: string; text?: string }[];
		outcome.result = {
			text: content.map((part) => part.text ?? `<${part.type}>`),
			isError: result.isError === true,
			...(result.structuredContent === undefined ? {} : { structuredContent: result.structuredContent }),
		};
	} catch (error) {
		const { code, message } = error as { code: number; message: string };
		outcome.protocolError = { code, message };
	}

	outcome.requests = [...mock.requests];
	return normalize(outcome, mock);
}

export interface HttpServer {
	origin: string;
	port: number;
	stderr: () => string;
	exited: Promise<number | null>;
	signal(signal: NodeJS.Signals): void;
	stop(): Promise<void>;
}

async function freePort(): Promise<number> {
	const server = createNetServer();
	await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
	const { port } = server.address() as AddressInfo;
	await new Promise((resolve) => server.close(resolve));
	return port;
}

export async function startHttpServer(env: Record<string, string>): Promise<HttpServer> {
	const port = await freePort();
	const child = spawn(process.execPath, [serverPath()], {
		cwd: emptyWorkdir(),
		env: { PATH: process.env.PATH ?? '', TRANSPORT_TYPE: 'httpStream', PORT: String(port), ...env },
	});
	let stderr = '';
	child.stderr.on('data', (chunk) => (stderr += chunk));
	const exited = new Promise<number | null>((resolve) => child.on('exit', (code) => resolve(code)));
	const origin = `http://localhost:${port}`;

	const end = Date.now() + 5000;
	while (Date.now() < end) {
		const ready = await fetch(`${origin}/health`).then(
			() => true,
			() => false,
		);
		if (ready || child.exitCode !== null) {
			break;
		}
		await new Promise((resolve) => setTimeout(resolve, 50));
	}

	return {
		origin,
		port,
		stderr: () => stderr,
		exited,
		signal: (signal) => child.kill(signal),
		async stop() {
			if (child.exitCode === null) {
				child.kill('SIGKILL');
				await exited;
			}
		},
	};
}

export interface CapturedResponse {
	status: number;
	headers: Headers;
	json: unknown;
}

export interface HttpClientOptions {
	era?: Era;
	headers?: Record<string, string>;
	capture?: CapturedResponse[];
}

export async function connectHttp(server: HttpServer, { era, headers = {}, capture }: HttpClientOptions = {}) {
	const captureFetch: typeof fetch = async (input, init) => {
		const response = await fetch(input, init);
		if (capture) {
			const isJson = response.headers.get('content-type')?.includes('application/json');
			capture.push({ status: response.status, headers: response.headers, json: isJson ? await response.clone().json() : undefined });
		}
		return response;
	};
	const transport = new StreamableHTTPClientTransport(new URL(`${server.origin}/mcp`), { requestInit: { headers }, fetch: captureFetch });
	const client = new Client({ name: 'contract-test', version: '1.0.0' }, clientOptions(era));
	await client.connect(transport);
	return client;
}

export interface RawResponse {
	status: number;
	headers: IncomingHttpHeaders;
	body: string;
}

export const INITIALIZE_BODY = JSON.stringify({
	jsonrpc: '2.0',
	id: 1,
	method: 'initialize',
	params: { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'raw', version: '1.0.0' } },
});

/** A request with exact headers. fetch does not let a caller set Host. */
export function rawRequest(
	server: HttpServer,
	path: string,
	{ method = 'POST', headers = {}, body }: { method?: string; headers?: Record<string, string>; body?: string } = {},
) {
	return new Promise<RawResponse>((resolve, reject) => {
		const req = httpRequest(
			{
				host: 'localhost',
				port: server.port,
				path,
				method,
				headers: {
					Host: `localhost:${server.port}`,
					...(body === undefined ? {} : { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' }),
					...headers,
				},
			},
			(res) => {
				let text = '';
				res.on('data', (chunk) => (text += chunk));
				res.on('end', () => resolve({ status: res.statusCode ?? 0, headers: res.headers, body: text }));
			},
		);
		req.on('error', reject);
		req.end(body);
	});
}
