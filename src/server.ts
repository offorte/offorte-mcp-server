import { config } from './config/env.js';
import { startHttp } from './entries/http.js';
import { startStdio } from './entries/stdio.js';

const version = process.env.npm_package_version || '0.0.0';

if (config.transportType === 'httpStream') {
	startHttp({ apiHost: config.apiHost, version, credentials: config.credentials, ...config.http });
} else {
	startStdio({ apiHost: config.apiHost, version, credentials: config.credentials });
}
