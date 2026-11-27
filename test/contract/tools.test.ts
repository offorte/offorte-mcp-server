import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Client } from '@modelcontextprotocol/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { SERVER_INSTRUCTIONS } from '../../src/core/server.js';
import { CASES, type ContractCase } from './cases.js';
import { callTool, connectStdio, normalize, REPO_ROOT, type ToolOutcome } from './harness.js';
import { type MockApi, startMockApi } from './mock-api.js';

interface ListedTool {
	name: string;
	title?: string;
	description: string;
	annotations: Record<string, unknown> & { title: string };
	inputSchema: { properties?: Record<string, unknown>; required?: string[] };
}

interface Baseline {
	tools: ListedTool[];
	guard: ToolOutcome;
	unknownTool: ToolOutcome;
	cases: Record<string, ToolOutcome>;
}

const baseline = JSON.parse(readFileSync(join(REPO_ROOT, 'test/contract/baseline.json'), 'utf8')) as Baseline;

// The fixed part of a wrong-format error. The rest lists the Zod issues, and Zod 4 words them differently from Zod 3.
const formatErrorPrefix = (text: string) => /^.*?expected format\.?: /s.exec(text)?.[0];

function expectSameOutcome(testCase: ContractCase, actual: ToolOutcome) {
	const expected = baseline.cases[testCase.id];

	expect(expected, `baseline has case ${testCase.id}`).toBeDefined();
	expect(actual.requests).toEqual(expected.requests);
	expect(actual.result?.isError).toBe(expected.result?.isError);

	if (testCase.kind === 'invalid-input') {
		// The SDK writes the validation message
		expect(actual.result?.text[0]).toMatch(new RegExp(`^Input validation error: Invalid arguments for tool ${testCase.tool}`));
		return;
	}
	if (testCase.kind === 'wrong-format') {
		const actualPrefix = formatErrorPrefix(actual.result?.text[0] ?? '');
		expect(actualPrefix).toBeDefined();
		expect(actualPrefix).toBe(formatErrorPrefix(expected.result?.text[0] ?? ''));
		return;
	}
	expect(actual.result).toEqual(expected.result);
}

describe('tool contract over stdio, compared with the FastMCP baseline', () => {
	let mock: MockApi;
	let client: Client;

	beforeAll(async () => {
		mock = await startMockApi();
		client = await connectStdio(mock);
	});

	afterAll(async () => {
		await client?.close();
		await mock?.close();
	});

	it('sends the short server instruction', () => {
		expect(client.getInstructions()).toBe(SERVER_INSTRUCTIONS);
	});

	it('lists the same 33 tools with the same descriptions, titles, and annotations', async () => {
		const { tools } = (await client.listTools()) as unknown as { tools: ListedTool[] };
		const listed = normalize(tools, mock);

		expect(listed.map((tool) => tool.name).sort()).toEqual(baseline.tools.map((tool) => tool.name).sort());
		expect(listed).toHaveLength(33);

		for (const expected of baseline.tools) {
			const actual = listed.find((tool) => tool.name === expected.name)!;

			expect(actual.description, expected.name).toBe(expected.description);
			expect(actual.annotations, expected.name).toEqual(expected.annotations);
			expect(actual.title, expected.name).toBe(expected.annotations.title);
			expect(Object.keys(actual.inputSchema.properties ?? {}).sort(), expected.name).toEqual(Object.keys(expected.inputSchema.properties ?? {}).sort());
			expect((actual.inputSchema.required ?? []).sort(), expected.name).toEqual((expected.inputSchema.required ?? []).sort());
		}
	});

	// get_initial_context is the first case, so the guard lets every later case through
	it.each(CASES.map((testCase) => [testCase.id, testCase] as const))('%s', async (_id, testCase) => {
		expectSameOutcome(testCase, await callTool(client, mock, testCase));
	});

	it('answers an unknown tool with a protocol error with the same code', async () => {
		const outcome = await callTool(client, mock, { id: 'unknown', tool: 'no_such_tool', kind: 'tool-error', args: {} });

		expect(outcome.protocolError?.code).toBe(baseline.unknownTool.protocolError?.code);
		expect(outcome.requests).toEqual([]);
	});
});

describe('starter guard over stdio', () => {
	it('blocks other tools until get_initial_context has run on the connection', async () => {
		const mock = await startMockApi();
		const client = await connectStdio(mock);
		const usersCase: ContractCase = { id: 'guard', tool: 'get_account_users', kind: 'tool-error', args: {} };

		try {
			expect(await callTool(client, mock, usersCase)).toEqual(baseline.guard);

			await callTool(client, mock, CASES[0]);
			mock.queue([{ body: [] }]);
			const after = await callTool(client, mock, { ...usersCase, answers: [{ body: [] }] });
			expect(after.result).toEqual({ text: ['[]'], isError: false });
		} finally {
			await client.close();
			await mock.close();
		}
	});
});
