import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { createServer } from '../core/server.js';
import type { OfforteCredentials } from '../utils/requests.js';

export interface StdioOptions {
	credentials: OfforteCredentials;
	apiHost: string;
	version: string;
}

/** Serves one client over stdin and stdout. stdout carries only MCP messages, so logs go to stderr. */
export function startStdio({ credentials, apiHost, version }: StdioOptions) {
	serveStdio(() => createServer({ credentials, apiHost, version, guard: true }), {
		onerror: (error) => console.error(error),
	});
}
