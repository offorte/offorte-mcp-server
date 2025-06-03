import { FastMCP } from 'fastmcp';
import { registerTools } from './tools/register.js';
import { config } from './config/env.js';
const { TRANSPORT_TYPE } = config;

const server = new FastMCP({
	name: 'Offorte Proposals',
	version: (process.env.npm_package_version || '0.0.0') as `${number}.${number}.${number}`,
});

registerTools({ server });

if (TRANSPORT_TYPE === 'sse') {
	server.start({
		transportType: 'sse',
		sse: {
			endpoint: '/sse',
			port: 3000,
		},
	} as { transportType: 'sse'; sse: { endpoint: `/${string}`; port: number } });
} else {
	server.start({ transportType: 'stdio' });
}
