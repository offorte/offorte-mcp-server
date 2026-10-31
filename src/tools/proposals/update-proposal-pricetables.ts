import { type Tool, UserError } from 'fastmcp';
import { z } from 'zod';
import { get, patch } from '../../utils/requests.js';
import { proposalContentPricetableSchema, proposalDetailsSchema } from '../../schemas/proposals.js';
import { throwApiInvalidResponseError } from '../../utils/errors.js';

const parameters = z.object({
	proposal_id: z.number(),
	pricetables: z.array(proposalContentPricetableSchema),
});

export const updateProposalPricetablesTool: Tool<undefined, typeof parameters> = {
	name: 'update_proposal_pricetables',
	description:
		'Replace all rows of the named price tables in a proposal. Tables that are not named stay unchanged. Returns the updated tables and the proposal total',
	parameters,
	annotations: {
		title: 'Update Proposal Price Tables',
		destructiveHint: true,
		idempotentHint: true,
		openWorldHint: true,
	},
	async execute({ proposal_id, pricetables }) {
		// Send only the price tables, so this tool cannot change other proposal fields
		await patch(`/proposals/${proposal_id}/details/`, { content: { pricetables } });

		// The PATCH response has no data, so read the saved tables and totals back
		const result = await get(`/proposals/${proposal_id}/details/`).catch((error) => {
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
