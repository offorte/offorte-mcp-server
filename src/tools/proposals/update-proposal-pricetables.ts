import type { Tool } from '../../core/tool.js';
import { throwApiInvalidResponseError, UserError } from '../../utils/errors.js';
import { z } from 'zod';
import { proposalContentPricetableSchema, proposalDetailsSchema } from '../../schemas/proposals.js';

const parameters = z.object({
	proposal_id: z.number(),
	pricetables: z.array(proposalContentPricetableSchema),
});

export const updateProposalPricetablesTool: Tool<typeof parameters> = {
	name: 'update_proposal_pricetables',
	description:
		'Replace all rows of the named price tables in a proposal. Tables that are not named stay unchanged. Send every row of a named table, also the rows that do not change. Read the table ids with get_proposal_details first and never guess one. A table with id "" has no Unique ID and cannot be updated: tell the user to set one in the price table settings. get_proposal_details drops leading zeros from a Unique ID with only digits ("001" comes back as "1"). When an update fails with "no price table with this id", ask the user for the exact Unique ID. The result then does not list that table: call get_proposal_details to check its rows. The update clears a manual proposal total. On an open proposal the customer sees the change at once on the same link and loses their choices on replaced rows, so tell the user this and ask them to confirm first. Tell the user to close the proposal in the Editor first: an open Editor tab can save later and overwrite the change. Returns the updated tables and the proposal total',
	parameters,
	annotations: {
		title: 'Update Proposal Price Tables',
		readOnlyHint: false,
		destructiveHint: true,
		idempotentHint: true,
		openWorldHint: true,
	},
	async execute({ proposal_id, pricetables }, { api }) {
		// Send only the price tables, so this tool cannot change other proposal fields
		await api.patch(`/proposals/${proposal_id}/details/`, { content: { pricetables } });

		// The PATCH response has no data, so read the saved tables and totals back
		const result = await api.get(`/proposals/${proposal_id}/details/`).catch((error) => {
			throw new UserError(`The price tables were saved, but reading them back failed: ${error.message}`);
		});
		const parsed = proposalDetailsSchema.safeParse(result);

		if (!parsed.success) {
			return throwApiInvalidResponseError(parsed.error);
		}

		const ids = pricetables.map(({ id }) => id);

		return JSON.stringify({
			price_total: parsed.data.price_total,
			pricetables: parsed.data.content.pricetables.filter((table) => ids.includes(table.id)),
		});
	},
};
