import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import tseslint from 'typescript-eslint';

const CORE_BOUNDARY = 'The core serves stdio and HTTP. Only src/server.ts, src/config, and src/entries may use a transport, Hono, or the environment.';

export default tseslint.config(
	eslint.configs.recommended,
	tseslint.configs.recommended,
	eslintConfigPrettier,
	{
		ignores: ['dist/', '.history', '.cursor'],
	},
	{
		files: ['src/**/*.ts'],
		ignores: ['src/server.ts', 'src/config/**', 'src/entries/**'],
		rules: {
			'no-restricted-imports': [
				'error',
				{
					paths: [
						{
							name: '@modelcontextprotocol/server',
							importNames: [
								'createMcpHandler',
								'isLegacyRequest',
								'legacyStatelessFallback',
								'PerRequestHTTPServerTransport',
								'WebStandardStreamableHTTPServerTransport',
							],
							message: CORE_BOUNDARY,
						},
						{ name: '@modelcontextprotocol/server/stdio', message: CORE_BOUNDARY },
						{ name: '@modelcontextprotocol/hono', message: CORE_BOUNDARY },
						{ name: '@hono/node-server', message: CORE_BOUNDARY },
						{ name: 'hono', message: CORE_BOUNDARY },
						{ name: 'dotenv', message: CORE_BOUNDARY },
						{ name: 'node:process', importNames: ['env'], message: CORE_BOUNDARY },
						{ name: 'process', importNames: ['env'], message: CORE_BOUNDARY },
					],
					patterns: [{ group: ['hono/*', '**/config/*', '**/entries/*'], message: CORE_BOUNDARY }],
				},
			],
			'no-restricted-properties': ['error', { object: 'process', property: 'env', message: CORE_BOUNDARY }],
		},
	},
);
