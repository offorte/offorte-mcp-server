import type { Tool } from '../../core/tool.js';
import { z } from 'zod';
import { proposalDetailsSchema } from '../../schemas/proposals.js';
import { throwApiInvalidResponseError } from '../../utils/errors.js';

const parameters = z.object({
	proposal_id: z.number(),
});

export const getProposalDetailsTool: Tool<typeof parameters> = {
	name: 'get_proposal_details',
	description: 'Get all details for a proposal by id, including its price tables with their Unique IDs and rows',
	parameters,
	annotations: {
		title: 'Get Proposal Details',
		readOnlyHint: true,
		openWorldHint: true,
	},
	async execute({ proposal_id }, { api }) {
		const result = await api.get(`/proposals/${proposal_id}/details/`);
		const parsed = proposalDetailsSchema.safeParse(result);

		if (!parsed.success) {
			throwApiInvalidResponseError(parsed.error);
		}

		return JSON.stringify(parsed.data);
	},
};
