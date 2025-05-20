import { type Tool } from 'fastmcp';
import { get } from '../../utils/requests.js';
import { accountUsersSchema } from '../../schemas/account.js';
import { emptyObject as parameters } from '../../utils/schema.js';
import { throwApiInvalidResponseError } from '../../utils/errors.js';

export const getAccountUsersTool: Tool<undefined, typeof parameters> = {
	name: 'get_account_users',
	description: 'Lists all account users for the current account.',
	parameters,
	annotations: {
		title: 'Get Account Users',
		openWorldHint: true,
	},
	async execute() {
		const result = await get('/account/users');
		const parsed = accountUsersSchema.safeParse(result);

		if (!parsed.success) {
			throwApiInvalidResponseError(parsed.error);
		}

		return JSON.stringify(parsed.data);
	},
};
