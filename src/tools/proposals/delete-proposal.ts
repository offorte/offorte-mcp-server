import type { Tool } from '../../core/tool.js';
import { z } from 'zod';

const parameters = z.object({
	proposal_id: z.number(),
});

export const deleteProposalTool: Tool<typeof parameters> = {
	name: 'delete_proposal',
	description: 'Move a proposal to the trashcan. Confirm the proposal name with the user first. A user can restore it in Offorte under Settings > Trashcan',
	parameters,
	annotations: {
		title: 'Delete Proposal',
		readOnlyHint: false,
		destructiveHint: true,
		idempotentHint: false,
		openWorldHint: true,
	},
	async execute({ proposal_id }, { api }) {
		await api.request({ url: `/proposals/${proposal_id}/`, method: 'DELETE' });

		return `Proposal ${proposal_id} is in the trashcan. A user can restore it in Offorte under Settings > Trashcan.`;
	},
};
