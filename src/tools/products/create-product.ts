import type { Tool } from '../../core/tool.js';
import { throwApiInvalidResponseError, UserError } from '../../utils/errors.js';
import { z } from 'zod';
import { createProductSchema, productRecurring, productSelectable } from '../../schemas/products.js';

// directory_id and vat_id are required: the API silently uses the first directory or VAT group for an unknown id
const parameters = z.object({
	directory_id: z.number().describe('See get_product_directories'),
	name: z.string(),
	price: z.number(),
	vat_id: z.number().describe('See get_vat_groups'),
	sku: z.string().optional(),
	descr_short: z.string().optional().describe('Short description'),
	selectable: productSelectable.optional(),
	recurring: productRecurring.optional(),
});

export const createProductTool: Tool<typeof parameters> = {
	name: 'create_product',
	description:
		'Add a product to the product catalog. Ask the user to confirm the price first. Take directory_id only from get_product_directories and vat_id only from get_vat_groups, and never guess them: the API silently uses the first directory or VAT group for an unknown id. The account plan limits the number of products. Existing proposals do not change. Returns the new product_id',
	parameters,
	annotations: {
		title: 'Create Product',
		readOnlyHint: false,
		destructiveHint: false,
		idempotentHint: false,
		openWorldHint: true,
	},
	async execute({ directory_id, selectable, recurring, ...product }, { api }) {
		// The API reads every body value as text, so false arrives as "" and create stores that in the option column. Send the stored text "false".
		const result = await api.post(`/products/${directory_id}/`, {
			...product,
			selectable: selectable === false ? 'false' : selectable,
			recurring: recurring === false ? 'false' : recurring,
		});
		const parsed = createProductSchema.safeParse(result);

		if (!parsed.success) {
			return throwApiInvalidResponseError(parsed.error);
		}

		if ('total' in parsed.data) {
			throw new UserError('The product was not created: the product limit of the account plan is reached.');
		}

		return JSON.stringify(parsed.data);
	},
};
