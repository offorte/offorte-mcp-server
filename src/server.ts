import { FastMCP } from 'fastmcp';
import { registerTools } from './tools/register.js';

const server = new FastMCP({
	name: 'Offorte Proposals',
	version: (process.env.npm_package_version || '0.0.0') as `${number}.${number}.${number}`,
});

registerTools({ server });

server.start({
	transportType: 'stdio',
});
