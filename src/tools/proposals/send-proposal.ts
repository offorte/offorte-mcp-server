import { type Tool } from 'fastmcp';
import { post } from '../../utils/requests.js';
import { sendProposalSchema } from '../../schemas/proposals.js';
import { throwApiInvalidResponseError } from '../../utils/errors.js';
import { z } from 'zod';

const parameters = z.object({
	proposal_id: z.number(),
	send_message_id: z.number().optional(),
	send_method: z.enum(['offorte', 'self']).default('offorte').optional(),
	send_message: z.string().optional(),
	password_reset: z.boolean().optional(),
});

export const sendProposalTool: Tool<typeof parameters._type, typeof parameters> = {
	name: 'send_proposal',
	description: 'Send a proposal to its assigned contacts',
	parameters,
	annotations: {
		title: 'Send Proposal',
		openWorldHint: true,
	},
	async execute({ proposal_id, ...body }) {
		const result = await post(`/proposals/${proposal_id}/send/`, body);
		const parsed = sendProposalSchema.safeParse(result);

		if (!parsed.success) {
			throwApiInvalidResponseError(parsed.error);
		}

		return JSON.stringify(parsed.data);
	},
};
