import type { Tool } from '../../core/tool.js';
import { productDirectoriesSchema } from '../../schemas/products.js';
import { emptyObject as parameters } from '../../utils/schema.js';
import { throwApiInvalidResponseError } from '../../utils/errors.js';

export const getProductDirectoriesTool: Tool<typeof parameters> = {
	name: 'get_product_directories',
	description: 'Lists the directories of the product catalog. Use a directory id with get_products and create_product',
	parameters,
	annotations: {
		title: 'Get Product Directories',
		readOnlyHint: true,
		openWorldHint: true,
	},
	async execute(_args, { api }) {
		const result = await api.get('/products/directories/');
		const parsed = productDirectoriesSchema.safeParse(result);

		if (!parsed.success) {
			return throwApiInvalidResponseError(parsed.error);
		}

		return JSON.stringify(parsed.data);
	},
};
