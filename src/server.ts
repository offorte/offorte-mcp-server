import { FastMCP } from 'fastmcp';

import pkgJson from '../package.json' with { type: 'json' };

const server = new FastMCP({
	name: 'Offorte',
	version: pkgJson.version as `${number}.${number}.${number}`,
});

server.start({
	transportType: 'stdio',
});
