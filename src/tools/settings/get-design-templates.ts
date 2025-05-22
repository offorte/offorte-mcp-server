import { type Tool } from 'fastmcp';
import { get } from '../../utils/requests.js';
import { designTemplatesSchema } from '../../schemas/settings.js';
import { emptyObject as parameters } from '../../utils/schema.js';
import { throwApiInvalidResponseError } from '../../utils/errors.js';

export const getDesignTemplatesTool: Tool<undefined, typeof parameters> = {
	name: 'get_design_templates',
	description: 'Lists available design templates which are used to create new proposals',
	parameters,
	annotations: {
		title: 'Get Design Templates',
		openWorldHint: true,
	},
	async execute() {
		const result = await get('/settings/design-templates');
		const parsed = designTemplatesSchema.safeParse(result);

		if (!parsed.success) {
			throwApiInvalidResponseError(parsed.error);
		}

		return JSON.stringify(parsed.data);
	},
};
