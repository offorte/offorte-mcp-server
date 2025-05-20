import { type Tool } from 'fastmcp';
import { get } from '../../utils/requests.js';
import { textTemplatesSchema } from '../../schemas/settings.js';
import { emptyObject as parameters } from '../../utils/schema.js';
import { throwApiInvalidResponseError } from '../../utils/errors.js';

export const getTextTemplatesTool: Tool<undefined, typeof parameters> = {
	name: 'get_text_templates',
	description: 'Lists available language text templates which are used to create new proposals in Offorte.',
	parameters,
	annotations: {
		title: 'Get Language Text Templates',
		openWorldHint: true,
	},
	async execute() {
		const result = await get('/settings/text-templates');
		const parsed = textTemplatesSchema.safeParse(result);

		if (!parsed.success) {
			throwApiInvalidResponseError(parsed.error);
		}

		return JSON.stringify(parsed.data);
	},
};
