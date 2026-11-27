import dotenv from 'dotenv';
import { z } from 'zod';
import type { OfforteCredentials } from '../utils/requests.js';

dotenv.config();

const unsetIfEmpty = <T extends z.ZodType>(schema: T) => z.preprocess((value) => (value === '' ? undefined : value), schema);

const EnvSchema = z.object({
	OFFORTE_API_HOST: unsetIfEmpty(z.string().default('https://gateway.offorte.com/api/v2/')).describe('Offorte API host'),
	OFFORTE_ACCOUNT_NAME: unsetIfEmpty(z.string().optional()).describe('Offorte Account Name'),
	OFFORTE_API_KEY: unsetIfEmpty(z.string().optional()).describe('Offorte API key'),
	TRANSPORT_TYPE: unsetIfEmpty(
		z
			.enum(['stdio', 'httpStream', 'sse'])
			.default('stdio')
			.transform((val) => {
				if (val === 'sse') {
					console.warn(
						'[DEPRECATED] TRANSPORT_TYPE="sse" is deprecated. Use "httpStream" instead. The /sse endpoint is gone: clients must connect to /mcp.',
					);
					return 'httpStream' as const;
				}
				return val;
			}),
	).describe('Transport type for MCP server'),
	HOST: unsetIfEmpty(z.string().default('localhost')).describe('HTTP listen address'),
	PORT: unsetIfEmpty(z.coerce.number().int().min(0).max(65535).default(3000)).describe('HTTP listen port'),
	ALLOWED_HOSTS: unsetIfEmpty(z.string().optional())
		.transform((value) =>
			value
				?.split(',')
				.map((host) => host.trim())
				.filter(Boolean),
		)
		.describe('Comma-separated host names that the Host header on /mcp may carry'),
});

function fail(...messages: unknown[]): never {
	console.error(...messages);
	process.exit(1);
}

const env = EnvSchema.safeParse(process.env);

if (!env.success) {
	fail('Invalid environment variables', z.treeifyError(env.error).properties);
}

const { OFFORTE_API_HOST, OFFORTE_ACCOUNT_NAME, OFFORTE_API_KEY, TRANSPORT_TYPE, HOST, PORT, ALLOWED_HOSTS } = env.data;

const credentials: OfforteCredentials | undefined =
	OFFORTE_ACCOUNT_NAME && OFFORTE_API_KEY ? { accountName: OFFORTE_ACCOUNT_NAME, apiKey: OFFORTE_API_KEY } : undefined;

if (!credentials && (OFFORTE_ACCOUNT_NAME || OFFORTE_API_KEY)) {
	fail(
		'Invalid environment variables: set both OFFORTE_ACCOUNT_NAME and OFFORTE_API_KEY to serve one account, or set neither to take the credentials from each request.',
	);
}

interface HttpConfig {
	host: string;
	port: number;
	allowedHosts: string[] | undefined;
}

export type Config = {
	apiHost: string;
	http: HttpConfig;
} & ({ transportType: 'stdio'; credentials: OfforteCredentials } | { transportType: 'httpStream'; credentials: OfforteCredentials | undefined });

function selectConfig(): Config {
	const common = {
		apiHost: OFFORTE_API_HOST,
		http: { host: HOST, port: PORT, allowedHosts: ALLOWED_HOSTS },
	};

	if (TRANSPORT_TYPE === 'httpStream') {
		return { ...common, transportType: TRANSPORT_TYPE, credentials };
	}
	if (!credentials) {
		return fail('Invalid environment variables: stdio mode needs OFFORTE_ACCOUNT_NAME and OFFORTE_API_KEY.');
	}
	return { ...common, transportType: TRANSPORT_TYPE, credentials };
}

export const config = selectConfig();
