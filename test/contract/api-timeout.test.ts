import { Client, InMemoryTransport } from '@modelcontextprotocol/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { API_TIMEOUT_MS, createServer } from '../../src/core/server.js';
import { ACCOUNT, API_KEY, callTool } from './harness.js';
import { type MockApi, startMockApi } from './mock-api.js';

const TEST_TIMEOUT_MS = 200;
const SLOW = { body: {}, delayMs: 2000 };

describe('Offorte API timeout', () => {
	let mock: MockApi;
	let client: Client;

	beforeAll(async () => {
		mock = await startMockApi();
		const server = createServer({
			credentials: { accountName: ACCOUNT, apiKey: API_KEY },
			apiHost: mock.apiHost,
			version: 'test',
			guard: false,
			apiTimeoutMs: TEST_TIMEOUT_MS,
		});
		const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
		await server.connect(serverTransport);
		client = new Client({ name: 'timeout-test', version: '1.0.0' });
		await client.connect(clientTransport);
	});

	afterAll(async () => {
		await client?.close();
		await mock?.close();
	});

	it('is 30 seconds in the server', () => {
		expect(API_TIMEOUT_MS).toBe(30_000);
	});

	it('ends a slow read with a clear error and stops the call', async () => {
		const outcome = await callTool(client, mock, { id: 'read', tool: 'get_account_users', kind: 'api-error', args: {}, answers: [SLOW] });

		expect(outcome.result?.isError).toBe(true);
		expect(outcome.result?.text[0]).toBe('Request failed: The Offorte API did not answer within 0.2 seconds.');
		await expect.poll(() => mock.aborted.length).toBe(1);
	});

	it('warns that a slow write may have been saved', async () => {
		const outcome = await callTool(client, mock, {
			id: 'write',
			tool: 'update_product_directory',
			kind: 'api-error',
			args: { directory_id: 20, name: 'Renamed' },
			answers: [SLOW],
		});

		expect(outcome.result?.isError).toBe(true);
		expect(outcome.result?.text[0]).toBe(
			'Request failed: The Offorte API did not answer within 0.2 seconds. The change may have been saved. Check the current state before you repeat this call.',
		);
	});

	it('says the write was saved when the read-back is slow', async () => {
		const outcome = await callTool(client, mock, {
			id: 'read-back',
			tool: 'update_contact',
			kind: 'read-back',
			args: { contact_id: 10, city: 'Delft' },
			answers: [{ body: {} }, SLOW],
		});

		expect(outcome.result?.text[0]).toBe(
			'The contact change was saved. Do not repeat it. Reading it back failed: Request failed: The Offorte API did not answer within 0.2 seconds.',
		);
	});
});
