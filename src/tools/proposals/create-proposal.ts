import { type Tool } from 'fastmcp';
import { z } from 'zod';
import { post } from '../../utils/requests.js';
import { createProposalSchema } from '../../schemas/proposals.js';
import { throwApiInvalidResponseError } from '../../utils/errors.js';

const parameters = z.object({
	account_user_id: z.number().optional(),
	contact_id: z.number(),
	contact_people: z.array(z.number()),
	design_template_id: z.number(),
	name: z.string(),
	proposal_template_id: z.number(),
	text_template_id: z.number(),
	custom_fields: z.array(z.object({ name: z.string(), value: z.string() })).optional(),
	// automations_set_id: z.number().optional(),
	// content: proposalContentSchema.optional(),
	// directory_id: z.number().optional(),
	// tags: z.array(z.union([z.string(), z.object({ id: z.number(), name: z.string() })])).optional(),
});

export const createProposalTool: Tool<typeof parameters._type, typeof parameters> = {
	name: 'create_proposal',
	description: 'Create a new proposal',
	parameters,
	annotations: {
		title: 'Create Proposal',
		openWorldHint: true,
	},
	async execute(params) {
		const result = await post('/proposals/', params);
		const parsed = createProposalSchema.safeParse(result);

		if (!parsed.success) {
			throwApiInvalidResponseError(parsed.error);
		}

		return JSON.stringify(parsed.data);
	},
};
