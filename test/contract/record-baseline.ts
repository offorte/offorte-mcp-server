/**
 * Records the expected contract values from a server build.
 * Run it against the FastMCP baseline (commit 4037cda):
 *   CONTRACT_SERVER=<baseline>/dist/server.js pnpm exec tsx test/contract/record-baseline.ts
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { CASES } from './cases.js';
import { callTool, connectStdio, normalize, REPO_ROOT } from './harness.js';
import { startMockApi } from './mock-api.js';

export const BASELINE_FILE = join(REPO_ROOT, 'test/contract/baseline.json');

const mock = await startMockApi();

const guardClient = await connectStdio(mock);
const guard = await callTool(guardClient, mock, { id: 'guard', tool: 'get_account_users', kind: 'tool-error', args: {} });
await guardClient.close();

const client = await connectStdio(mock);
const { tools } = await client.listTools();
const outcomes: Record<string, unknown> = {};

for (const testCase of CASES) {
	outcomes[testCase.id] = await callTool(client, mock, testCase);
}
const unknownTool = await callTool(client, mock, { id: 'unknown', tool: 'no_such_tool', kind: 'tool-error', args: {} });
await client.close();
await mock.close();

const record = {
	recordedFrom: 'commit 4037cda (FastMCP 4.28.4)',
	tools: normalize(tools, mock),
	guard,
	unknownTool,
	cases: outcomes,
};

writeFileSync(BASELINE_FILE, `${JSON.stringify(record, null, '\t')}\n`);
console.error(`Recorded ${tools.length} tools and ${CASES.length} cases in ${BASELINE_FILE}`);
