import { spawn } from 'node:child_process';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { SERVER_INSTRUCTIONS } from '../../src/core/server.js';
import { CASES } from './cases.js';
import { ACCOUNT, callTool, connectStdio, emptyWorkdir, type Era, MODERN_REVISION, serverPath } from './harness.js';
import { type MockApi, startMockApi } from './mock-api.js';

function runServer(env: Record<string, string>, stdin?: string) {
	return new Promise<{ code: number | null; stdout: string; stderr: string }>((resolve) => {
		const child = spawn(process.execPath, [serverPath()], { cwd: emptyWorkdir(), env: { PATH: process.env.PATH ?? '', ...env } });
		let stdout = '';
		let stderr = '';
		child.stdout.on('data', (chunk) => (stdout += chunk));
		child.stderr.on('data', (chunk) => (stderr += chunk));
		child.on('exit', (code) => resolve({ code, stdout, stderr }));

		if (stdin !== undefined) {
			child.stdin.write(stdin);
			// Give the server time to answer, then close stdin so it exits
			setTimeout(() => child.stdin.end(), 1000);
		}
	});
}

const waitFor = async (check: () => boolean, timeoutMs = 3000) => {
	const end = Date.now() + timeoutMs;
	while (!check() && Date.now() < end) {
		await new Promise((resolve) => setTimeout(resolve, 20));
	}
	return check();
};

describe('stdio', () => {
	let mock: MockApi;

	beforeAll(async () => {
		mock = await startMockApi();
	});

	afterAll(async () => {
		await mock?.close();
	});

	it.each<Era>(['legacy', 'modern'])('serves a %s-era client', async (era) => {
		const client = await connectStdio(mock, { era });

		try {
			expect(client.getNegotiatedProtocolVersion()).toBe(era === 'modern' ? MODERN_REVISION : '2025-11-25');
			expect(client.getInstructions()).toBe(SERVER_INSTRUCTIONS);
			expect((await client.listTools()).tools).toHaveLength(33);

			const context = await callTool(client, mock, CASES[0]);
			// Today the outdent template cuts the start of the line: "nt Name: <account>"
			expect(context.result?.text[0]).toContain(`Name: ${ACCOUNT}\n`);

			const users = await callTool(client, mock, CASES.find(({ id }) => id === 'get_account_users')!);
			expect(users.result?.isError).toBe(false);
			expect(users.requests).toHaveLength(1);
		} finally {
			await client.close();
		}
	});

	it.each<Era>(['legacy', 'modern'])('stops the running API call when a %s-era client cancels', async (era) => {
		const client = await connectStdio(mock, { era });

		try {
			await callTool(client, mock, CASES[0]);
			mock.reset();
			mock.queue([{ body: [], delayMs: 10_000 }]);

			const cancel = new AbortController();
			const call = client.callTool({ name: 'get_account_users', arguments: {} }, { signal: cancel.signal });
			expect(await waitFor(() => mock.requests.length === 1)).toBe(true);

			cancel.abort();
			await expect(call).rejects.toThrow();
			expect(await waitFor(() => mock.aborted.length === 1)).toBe(true);
		} finally {
			await client.close();
		}
	});

	it.each([
		['one credential', { OFFORTE_API_KEY: 'ofk_test' }],
		['no credentials', {}],
	])('exits with a message on stderr with %s', async (_name, env) => {
		const { code, stdout, stderr } = await runServer(env);

		expect(code).not.toBe(0);
		expect(stderr).toContain('OFFORTE_ACCOUNT_NAME');
		expect(stdout).toBe('');
	});

	it('writes only MCP messages to stdout', async () => {
		const initialize = {
			jsonrpc: '2.0',
			id: 1,
			method: 'initialize',
			params: { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'raw', version: '1.0.0' } },
		};
		const { stdout } = await runServer(
			{ OFFORTE_ACCOUNT_NAME: ACCOUNT, OFFORTE_API_KEY: 'ofk_test', OFFORTE_API_HOST: mock.apiHost, TRANSPORT_TYPE: 'stdio' },
			`${JSON.stringify(initialize)}\n`,
		);
		const lines = stdout.split('\n').filter(Boolean);

		expect(lines.length).toBeGreaterThan(0);
		for (const line of lines) {
			expect(JSON.parse(line)).toMatchObject({ jsonrpc: '2.0' });
		}
	});
});
