import type { Tool } from '../../core/tool.js';
import { sendProposalSchema } from '../../schemas/proposals.js';
import { throwApiInvalidResponseError } from '../../utils/errors.js';
import { z } from 'zod';

const parameters = z.object({
	proposal_id: z.number(),
	send_message_id: z.number().optional(),
	// Advertise the API default, but do not send it: Zod 4 would apply .default() inside .optional() and add send_method to the request
	send_method: z.enum(['offorte', 'self']).optional().meta({ default: 'offorte' }),
	send_message: z.string().optional(),
	password_reset: z.boolean().optional(),
});

export const sendProposalTool: Tool<typeof parameters> = {
	name: 'send_proposal',
	description: 'Send a proposal to its assigned contacts',
	parameters,
	annotations: {
		title: 'Send Proposal',
		readOnlyHint: false,
		destructiveHint: true,
		idempotentHint: false,
		openWorldHint: true,
	},
	async execute({ proposal_id, ...body }, { api }) {
		const result = await api.post(`/proposals/${proposal_id}/send/`, body);
		const parsed = sendProposalSchema.safeParse(result);

		if (!parsed.success) {
			throwApiInvalidResponseError(parsed.error);
		}

		return JSON.stringify(parsed.data);
	},
};
