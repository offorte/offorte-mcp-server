import { type Tool } from 'fastmcp';
import { z } from 'zod';
import { get } from '../../utils/requests.js';
import { proposalDetailsSchema } from '../../schemas/proposals.js';
import { throwApiInvalidResponseError } from '../../utils/errors.js';

const parameters = z.object({
	proposal_id: z.number(),
});

export const getProposalDetailsTool: Tool<undefined, typeof parameters> = {
	name: 'get_proposal_details',
	description: 'Get all details for a proposal by id, including its price tables with their Unique IDs and rows',
	parameters,
	annotations: {
		title: 'Get Proposal Details',
		openWorldHint: true,
	},
	async execute({ proposal_id }) {
		const result = await get(`/proposals/${proposal_id}/details/`);
		const parsed = proposalDetailsSchema.safeParse(result);

		if (!parsed.success) {
			throwApiInvalidResponseError(parsed.error);
		}

		return JSON.stringify(parsed.data);
	},
};
