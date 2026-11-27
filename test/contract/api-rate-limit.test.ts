import { Client, InMemoryTransport } from '@modelcontextprotocol/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createServer } from '../../src/core/server.js';
import { ACCOUNT, API_KEY, callTool } from './harness.js';
import { type MockApi, startMockApi } from './mock-api.js';

const RATE_LIMITED = { status: 429, body: { message: 'API rate limit exceeded' } };
const RATE_LIMIT_TEXT =
	'Request failed: The Offorte API got too many requests (status 429). Wait a few seconds before the next call, and run tool calls one after the other, not at the same time.';

describe('Offorte API rate limit', () => {
	let mock: MockApi;
	let client: Client;

	beforeAll(async () => {
		mock = await startMockApi();
		const server = createServer({
			credentials: { accountName: ACCOUNT, apiKey: API_KEY },
			apiHost: mock.apiHost,
			version: 'test',
			guard: false,
		});
		const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
		await server.connect(serverTransport);
		client = new Client({ name: 'rate-limit-test', version: '1.0.0' });
		await client.connect(clientTransport);
	});

	afterAll(async () => {
		await client?.close();
		await mock?.close();
	});

	it('ends a rate-limited call with a clear error', async () => {
		const outcome = await callTool(client, mock, { id: 'read', tool: 'get_account_users', kind: 'api-error', args: {}, answers: [RATE_LIMITED] });

		expect(outcome.result?.isError).toBe(true);
		expect(outcome.result?.text[0]).toBe(RATE_LIMIT_TEXT);
	});

	it('keeps the do-not-repeat warning when the read-back is rate-limited', async () => {
		const outcome = await callTool(client, mock, {
			id: 'read-back',
			tool: 'update_contact',
			kind: 'read-back',
			args: { contact_id: 10, city: 'Delft' },
			answers: [{ body: {} }, RATE_LIMITED],
		});

		expect(outcome.result?.text[0]).toBe(`The contact change was saved. Do not repeat it. Reading it back failed: ${RATE_LIMIT_TEXT}`);
	});
});
