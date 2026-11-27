import type { Tool } from '../../core/tool.js';
import { automationSetsSchema } from '../../schemas/automations.js';
import { emptyObject as parameters } from '../../utils/schema.js';
import { throwApiInvalidResponseError } from '../../utils/errors.js';

export const getAutomationSetsTool: Tool<typeof parameters> = {
	name: 'get_automation_sets',
	description: 'Lists automation sets which are used as an optional input to create a new proposal',
	parameters,
	annotations: {
		title: 'Get Automation Sets',
		readOnlyHint: true,
		openWorldHint: true,
	},
	async execute(_args, { api }) {
		const result = await api.get('/automations/sets');
		const parsed = automationSetsSchema.safeParse(result);

		if (!parsed.success) {
			throwApiInvalidResponseError(parsed.error);
		}

		return JSON.stringify(parsed.data);
	},
};
