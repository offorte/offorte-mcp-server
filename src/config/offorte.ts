import { env } from './env.js';

if (!env.success) {
	throw new Error('Environment variables are not properly configured');
}

export const config = {
	accountName: env.data.OFFORTE_ACCOUNT_NAME,
	apiUrl: `${env.data.OFFORTE_API_HOST}${env.data.OFFORTE_ACCOUNT_NAME}`,
	apiKey: env.data.OFFORTE_API_KEY,
};
