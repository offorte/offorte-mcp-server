import type { Tool } from '../../core/tool.js';
import { z } from 'zod';
import { productDirectoriesSchema } from '../../schemas/products.js';

const parameters = z.object({
	name: z.string(),
});

export const createProductDirectoryTool: Tool<typeof parameters> = {
	name: 'create_product_directory',
	description:
		'Create a directory in the product catalog. The API returns no id, so this returns all product directories. The new directory has the given name and the highest id',
	parameters,
	annotations: {
		title: 'Create Product Directory',
		readOnlyHint: false,
		destructiveHint: false,
		idempotentHint: false,
		openWorldHint: true,
	},
	async execute({ name }, { api }) {
		await api.post('/products/directories/', { name });
		const directories = await api.getAfterWrite('/products/directories/', productDirectoriesSchema, 'The product directory');

		return JSON.stringify(directories);
	},
};
