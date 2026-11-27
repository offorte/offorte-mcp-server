import type { Tool } from '../../core/tool.js';
import { tagsSchema } from '../../schemas/settings.js';
import { emptyObject as parameters } from '../../utils/schema.js';
import { throwApiInvalidResponseError } from '../../utils/errors.js';

export const getTagsTool: Tool<typeof parameters> = {
	name: 'get_tags',
	description: 'Lists the existing tags of the account. Assign an existing tag as { id, name } instead of creating a near-duplicate',
	parameters,
	annotations: {
		title: 'Get Tags',
		readOnlyHint: true,
		openWorldHint: true,
	},
	async execute(_args, { api }) {
		const result = await api.get('/settings/tags/');
		const parsed = tagsSchema.safeParse(result);

		if (!parsed.success) {
			return throwApiInvalidResponseError(parsed.error);
		}

		return JSON.stringify(parsed.data);
	},
};
