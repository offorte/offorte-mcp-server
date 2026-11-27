import type { Tool } from '../../core/tool.js';
import { throwApiInvalidResponseError, UserError } from '../../utils/errors.js';
import { z } from 'zod';
import { proposalDetailsSchema } from '../../schemas/proposals.js';
import { proposalStatus } from '../../schemas/shared.js';

const parameters = z.object({
	proposal_id: z.number(),
	status: proposalStatus,
});

export const updateProposalStatusTool: Tool<typeof parameters> = {
	name: 'update_proposal_status',
	description:
		'Change the status of a proposal. Ask the user to confirm first. Won runs the "proposal won" automations, sends the proposal_won webhook and stores the approval data. Lost and closed run the "proposal lost or closed" automations. Open or won uses one API credit when the proposal was never sent or charged before. The proposal leaves its directory. A won proposal cannot change status with this tool. The current status changes nothing. To send a proposal, use send_proposal. Returns the proposal details after the change',
	parameters,
	annotations: {
		title: 'Update Proposal Status',
		readOnlyHint: false,
		destructiveHint: true,
		idempotentHint: false,
		openWorldHint: true,
	},
	async execute({ proposal_id, status }, { api }) {
		const url = `/proposals/${proposal_id}/details/`;

		// Read first: the API lets a won proposal change status, and that deletes its approval data for good
		const current = proposalDetailsSchema.safeParse(await api.get(url));

		if (!current.success) {
			return throwApiInvalidResponseError(current.error);
		}

		// No PATCH, so the automations of this status do not run again
		if (current.data.status === status) {
			return JSON.stringify(current.data);
		}

		if (current.data.status === 'won') {
			throw new UserError(
				'This proposal is won. A status change deletes its approval data and signing log for good, so this tool does not change it. Make this change in Offorte.',
			);
		}

		await api.patch(url, { status });
		const details = await api.getAfterWrite(url, proposalDetailsSchema, 'The status change');

		return JSON.stringify(details);
	},
};
