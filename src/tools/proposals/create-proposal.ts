import type { Tool } from '../../core/tool.js';
import { z } from 'zod';
import { createProposalSchema } from '../../schemas/proposals.js';
import { customFieldValuesSchema, tagsInputSchema } from '../../schemas/shared.js';
import { throwApiInvalidResponseError } from '../../utils/errors.js';

const parameters = z.object({
	account_user_id: z.number().optional(),
	contact_id: z.number(),
	contact_people: z.array(z.number()),
	design_template_id: z.number(),
	name: z.string(),
	proposal_template_id: z.number(),
	text_template_id: z.number(),
	custom_fields: customFieldValuesSchema.optional(),
	automations_set_id: z.number().optional().describe('See get_automation_sets'),
	// content: proposalContentSchema.optional(),
	directory_id: z.number().optional().describe('A proposal directory of status edit. See get_proposal_directories'),
	tags: tagsInputSchema.optional().describe('Strings create new tags, { id, name } objects assign existing tags. See get_tags'),
});

export const createProposalTool: Tool<typeof parameters> = {
	name: 'create_proposal',
	description: 'Create a new proposal',
	parameters,
	annotations: {
		title: 'Create Proposal',
		readOnlyHint: false,
		destructiveHint: false,
		idempotentHint: false,
		openWorldHint: true,
	},
	async execute(params, { api }) {
		const result = await api.post('/proposals/', params);
		const parsed = createProposalSchema.safeParse(result);

		if (!parsed.success) {
			throwApiInvalidResponseError(parsed.error);
		}

		return JSON.stringify(parsed.data);
	},
};
