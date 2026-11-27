import { McpServer } from '@modelcontextprotocol/server';
import { registerTools } from '../tools/register.js';
import type { OfforteCredentials } from '../utils/requests.js';

export const SERVER_NAME = 'Offorte Proposals';

/** Short on purpose: clients add server instructions to every prompt. get_initial_context returns the full instructions. */
export const SERVER_INSTRUCTIONS =
	'Call get_initial_context once at the start of each conversation. It returns the account context and the guide for tasks with several steps.';

/** Far above a normal API answer, and below the 60-second default request timeout of the SDK client */
export const API_TIMEOUT_MS = 30_000;

// tools/list is the same for every account, but only the requesting client may cache it
const TOOLS_LIST_CACHE_TTL_MS = 5 * 60 * 1000;

export interface CreateServerOptions {
	credentials: OfforteCredentials;
	apiHost: string;
	version: string;
	/** Require get_initial_context before other tools. Use it only for a server that lives as long as its connection. */
	guard: boolean;
	apiTimeoutMs?: number;
}

/** Builds a new server for one connection (stdio) or one request (HTTP). It holds no state that another instance can see. */
export function createServer({ credentials, apiHost, version, guard, apiTimeoutMs = API_TIMEOUT_MS }: CreateServerOptions): McpServer {
	const server = new McpServer(
		{ name: SERVER_NAME, version },
		{
			instructions: SERVER_INSTRUCTIONS,
			cacheHints: { 'tools/list': { ttlMs: TOOLS_LIST_CACHE_TTL_MS, cacheScope: 'private' } },
		},
	);

	registerTools({ server, credentials, apiHost, apiTimeoutMs, guard });

	return server;
}
