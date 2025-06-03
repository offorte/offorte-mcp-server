import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const ConfiguredSchema = z.object({
	OFFORTE_ACCOUNT_NAME: z.string().describe('Offorte Account Name'),
	OFFORTE_API_KEY: z.string().describe('Offorte API key'),
});

const EnvSchema = z
	.object({
		OFFORTE_API_HOST: z.string().optional().default('https://connect.offorte.com/api/v2/').describe('Offorte API host'),
		TRANSPORT_TYPE: z.enum(['stdio', 'sse']).optional().default('stdio').describe('Transport type for MCP server'),
	})
	.merge(ConfiguredSchema);

export type EnvType = z.infer<typeof EnvSchema>;

export const env = EnvSchema.safeParse(process.env);

if (!env.success) {
	console.error('Invalid environment variables', env.error.format());
	process.exit(1);
}

export const config = env.data as EnvType;
