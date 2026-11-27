import type { Tool } from '../../core/tool.js';
import { z } from 'zod';
import { productsSchema } from '../../schemas/products.js';
import { throwApiInvalidResponseError } from '../../utils/errors.js';

const parameters = z.object({
	directory_id: z.number().describe('See get_product_directories'),
});

export const getProductsTool: Tool<typeof parameters> = {
	name: 'get_products',
	description: 'Lists the catalog products of one product directory, with name, short description, price, VAT, SKU, selectable and recurring',
	parameters,
	annotations: {
		title: 'Get Products',
		readOnlyHint: true,
		openWorldHint: true,
	},
	async execute({ directory_id }, { api }) {
		const result = await api.get(`/products/${directory_id}/`);
		const parsed = productsSchema.safeParse(result);

		if (!parsed.success) {
			return throwApiInvalidResponseError(parsed.error);
		}

		return JSON.stringify(parsed.data);
	},
};
