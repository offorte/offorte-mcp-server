import { type Tool } from 'fastmcp';
import { get } from '../../utils/requests.js';
import { automationSetsSchema } from '../../schemas/automations.js';
import { emptyObject as parameters } from '../../utils/schema.js';
import { message } from '../../utils/errors.js';

export const getAutomationSetsTool: Tool<undefined, typeof parameters> = {
	name: 'get_automation_sets',
	description: 'Lists automation sets which are used as an optional input to create a new proposal in Offorte.',
	parameters,
	annotations: {
		title: 'Get Automation Sets',
		openWorldHint: true,
	},
	async execute() {
		const result = await get('/automations/sets');
		const parsed = automationSetsSchema.safeParse(result);

		if (!parsed.success) {
			throw new Error(message('invalidApiResponse'));
		}

		return JSON.stringify(parsed.data);
	},
};
