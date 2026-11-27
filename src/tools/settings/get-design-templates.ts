import type { Tool } from '../../core/tool.js';
import { designTemplatesSchema } from '../../schemas/settings.js';
import { emptyObject as parameters } from '../../utils/schema.js';
import { throwApiInvalidResponseError } from '../../utils/errors.js';

export const getDesignTemplatesTool: Tool<typeof parameters> = {
	name: 'get_design_templates',
	description: 'Lists available design templates which are used to create new proposals',
	parameters,
	annotations: {
		title: 'Get Design Templates',
		readOnlyHint: true,
		openWorldHint: true,
	},
	async execute(_args, { api }) {
		const result = await api.get('/settings/design-templates');
		const parsed = designTemplatesSchema.safeParse(result);

		if (!parsed.success) {
			throwApiInvalidResponseError(parsed.error);
		}

		return JSON.stringify(parsed.data);
	},
};
