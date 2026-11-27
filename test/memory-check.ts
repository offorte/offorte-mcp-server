/**
 * Checks that HTTP mode does not grow its memory per request.
 * Run: node --expose-gc --import tsx test/memory-check.ts
 */
import { serve } from '@hono/node-server';
import type { AddressInfo } from 'node:net';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHttpApp } from '../src/entries/http.js';
import { CASES } from './contract/cases.js';
import type { ToolOutcome } from './contract/harness.js';
import { startMockApi } from './contract/mock-api.js';

const TOTAL = 20_000;
const CONCURRENCY = 20;
const MAX_GROWTH = 0.1;
const ACCOUNTS = ['alpha', 'bravo'];

if (typeof globalThis.gc !== 'function') {
	throw new Error('Run with node --expose-gc');
}
const gc = globalThis.gc;

const baseline = JSON.parse(readFileSync(join(import.meta.dirname, 'contract/baseline.json'), 'utf8')) as { cases: Record<string, ToolOutcome> };

const mix = CASES.filter((testCase) => testCase.kind === 'success' && testCase.answers?.length === 1).map((testCase) => {
	const [request] = baseline.cases[testCase.id].requests;
	return { testCase, route: `${request.method} ${request.path.replace('/api/v2/acme/', '/')}`, body: testCase.answers![0].body };
});
const answers = new Map(mix.map(({ route, body }) => [route, body]));

let apiCalls = 0;
const mock = await startMockApi();
mock.respond = (request) => {
	mock.requests.length = 0;
	const route = `${request.method} ${request.path.replace(/^\/api\/v2\/[^/]+\//, '/')}`;
	apiCalls++;
	return { body: answers.get(route) ?? {} };
};

const { app } = createHttpApp({ apiHost: mock.apiHost, version: 'memory-check', host: '127.0.0.1', port: 0, allowedHosts: undefined, credentials: undefined });
const server = serve({ fetch: app.fetch, hostname: '127.0.0.1', port: 0 });
await new Promise((resolve) => server.once('listening', resolve));
const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/mcp`;

let sent = 0;
let failed = 0;

async function callOne(index: number) {
	const account = ACCOUNTS[index % ACCOUNTS.length];
	const { testCase } = mix[index % mix.length];
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json, text/event-stream',
			'MCP-Protocol-Version': '2025-11-25',
			Authorization: `Bearer ofk_test_${account}`,
			'X-Offorte-Account': account,
		},
		body: JSON.stringify({ jsonrpc: '2.0', id: index, method: 'tools/call', params: { name: testCase.tool, arguments: testCase.args } }),
	});
	const text = await response.text();
	// A JSON-RPC error also has status 200, but no result
	if (response.status !== 200 || !text.includes('"result"') || text.includes('"isError":true')) {
		failed++;
	}
}

async function run(until: number) {
	await Promise.all(
		Array.from({ length: CONCURRENCY }, async () => {
			while (sent < until) {
				await callOne(sent++);
			}
		}),
	);
}

function measure() {
	gc();
	gc();
	const { heapUsed, rss } = process.memoryUsage();
	return { heapUsed, rss };
}

const megabytes = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

await run(TOTAL / 2);
const half = measure();
await run(TOTAL);
const full = measure();

server.close();
await mock.close();

const growth = { heapUsed: full.heapUsed / half.heapUsed - 1, rss: full.rss / half.rss - 1 };
console.log(`Requests: ${sent}, failed: ${failed}, API calls: ${apiCalls}, tools in the mix: ${mix.length}`);
console.log(`heapUsed: ${megabytes(half.heapUsed)} at 50%, ${megabytes(full.heapUsed)} at 100% (${(growth.heapUsed * 100).toFixed(1)}%)`);
console.log(`RSS: ${megabytes(half.rss)} at 50%, ${megabytes(full.rss)} at 100% (${(growth.rss * 100).toFixed(1)}%)`);

const passed = failed === 0 && apiCalls === TOTAL && growth.heapUsed <= MAX_GROWTH && growth.rss <= MAX_GROWTH;
console.log(passed ? 'PASS' : 'FAIL');
process.exit(passed ? 0 : 1);
