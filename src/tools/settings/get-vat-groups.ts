import type { Tool } from '../../core/tool.js';
import { vatGroupsSchema } from '../../schemas/settings.js';
import { emptyObject as parameters } from '../../utils/schema.js';
import { throwApiInvalidResponseError } from '../../utils/errors.js';

export const getVatGroupsTool: Tool<typeof parameters> = {
	name: 'get_vat_groups',
	description: 'Lists the VAT groups of the account with their VAT percentage. Use a VAT group id as vat_id for products',
	parameters,
	annotations: {
		title: 'Get VAT Groups',
		readOnlyHint: true,
		openWorldHint: true,
	},
	async execute(_args, { api }) {
		const result = await api.get('/settings/vat-groups/');
		const parsed = vatGroupsSchema.safeParse(result);

		if (!parsed.success) {
			return throwApiInvalidResponseError(parsed.error);
		}

		return JSON.stringify(parsed.data);
	},
};
