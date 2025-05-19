import { FastMCP } from 'fastmcp';
import pkgJson from '../package.json' with { type: 'json' };
import { registerTools } from './tools/register.js';

const server = new FastMCP({
	name: 'Offorte Proposals',
	version: pkgJson.version as `${number}.${number}.${number}`,
});

registerTools({ server });

server.start({
	transportType: 'stdio',
});
