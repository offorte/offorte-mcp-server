import type { Tool } from '../../core/tool.js';
import { z } from 'zod';
import { productRecurring, productSelectable } from '../../schemas/products.js';

// The API replaces the full product: a missing sku, descr_short, selectable or recurring is cleared. So every field is required.
const parameters = z.object({
	product_id: z.number(),
	name: z.string(),
	price: z.number(),
	vat_id: z.number().describe('See get_vat_groups'),
	sku: z.string().describe('Send the current value to keep it'),
	descr_short: z.string().describe('Short description. Send the current value to keep it'),
	selectable: productSelectable,
	recurring: productRecurring,
	directory_id: z.number().optional().describe('Moves the product to this directory. See get_product_directories'),
});

export const updateProductTool: Tool<typeof parameters> = {
	name: 'update_product',
	description:
		'Replace all values of a catalog product. Read the product with get_products first and send every field, also the ones that do not change. Ask the user to confirm a price change first. Take vat_id only from get_vat_groups and directory_id only from get_product_directories, and never guess them. Existing proposals do not change',
	parameters,
	annotations: {
		title: 'Update Product',
		readOnlyHint: false,
		destructiveHint: true,
		idempotentHint: true,
		openWorldHint: true,
	},
	async execute({ product_id, ...product }, { api }) {
		await api.patch(`/product/${product_id}/`, product);

		return `Product ${product_id} is saved.`;
	},
};
