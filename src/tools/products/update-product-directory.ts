import type { Tool } from '../../core/tool.js';
import { z } from 'zod';

const parameters = z.object({
	directory_id: z.number(),
	name: z.string(),
});

export const updateProductDirectoryTool: Tool<typeof parameters> = {
	name: 'update_product_directory',
	description: 'Rename a directory of the product catalog',
	parameters,
	annotations: {
		title: 'Update Product Directory',
		readOnlyHint: false,
		destructiveHint: true,
		idempotentHint: true,
		openWorldHint: true,
	},
	async execute({ directory_id, name }, { api }) {
		await api.patch(`/products/directories/${directory_id}/`, { name });

		return `Product directory ${directory_id} is renamed.`;
	},
};
