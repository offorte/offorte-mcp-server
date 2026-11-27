import type { Tool } from '../../core/tool.js';
import { accountUsersSchema } from '../../schemas/account.js';
import { emptyObject as parameters } from '../../utils/schema.js';
import { throwApiInvalidResponseError } from '../../utils/errors.js';

export const getAccountUsersTool: Tool<typeof parameters> = {
	name: 'get_account_users',
	description: 'Lists all account users for the current account',
	parameters,
	annotations: {
		title: 'Get Account Users',
		readOnlyHint: true,
		openWorldHint: true,
	},
	async execute(_args, { api }) {
		const result = await api.get('/account/users');
		const parsed = accountUsersSchema.safeParse(result);

		if (!parsed.success) {
			throwApiInvalidResponseError(parsed.error);
		}

		return JSON.stringify(parsed.data);
	},
};
