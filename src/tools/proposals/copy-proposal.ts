import { type Tool } from 'fastmcp';
import { z } from 'zod';
import { post } from '../../utils/requests.js';
import { createProposalSchema } from '../../schemas/proposals.js';
import { throwApiInvalidResponseError } from '../../utils/errors.js';

const parameters = z.object({
	proposal_id: z.number(),
	name: z.string(),
	contact_id: z.number(),
	contact_people: z.array(z.number()).optional(),
	directory_id: z.number().optional(),
	account_user_id: z.number().optional(),
});

export const copyProposalTool: Tool<undefined, typeof parameters> = {
	name: 'copy_proposal',
	description: 'Copy a proposal into a new proposal with status edit, a new proposal number and a new link',
	parameters,
	annotations: {
		title: 'Copy Proposal',
		openWorldHint: true,
	},
	async execute({ proposal_id, ...body }) {
		const result = await post(`/proposals/${proposal_id}/copy/`, body);
		const parsed = createProposalSchema.safeParse(result);

		if (!parsed.success) {
			throwApiInvalidResponseError(parsed.error);
		}

		return JSON.stringify(parsed.data);
	},
};
