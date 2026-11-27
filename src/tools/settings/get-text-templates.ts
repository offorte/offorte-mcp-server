import type { Tool } from '../../core/tool.js';
import { textTemplatesSchema } from '../../schemas/settings.js';
import { emptyObject as parameters } from '../../utils/schema.js';
import { throwApiInvalidResponseError } from '../../utils/errors.js';

export const getTextTemplatesTool: Tool<typeof parameters> = {
	name: 'get_text_templates',
	description: 'Lists available language text templates which are used to create new proposals',
	parameters,
	annotations: {
		title: 'Get Language Text Templates',
		readOnlyHint: true,
		openWorldHint: true,
	},
	async execute(_args, { api }) {
		const result = await api.get('/settings/text-templates');
		const parsed = textTemplatesSchema.safeParse(result);

		if (!parsed.success) {
			throwApiInvalidResponseError(parsed.error);
		}

		return JSON.stringify(parsed.data);
	},
};
