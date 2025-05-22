import type { Tool } from 'fastmcp';
import { get } from '../../utils/requests.js';
import { proposalTemplatesSchema } from '../../schemas/favorites.js';
import { emptyObject as parameters } from '../../utils/schema.js';
import { throwApiInvalidResponseError } from '../../utils/errors.js';

export const getProposalTemplatesTool: Tool<undefined, typeof parameters> = {
	name: 'get_proposal_templates',
	description: `Lists proposal templates which are used as starting points to create new proposals`,
	parameters,
	annotations: {
		title: 'Get Proposal Templates',
		openWorldHint: true,
	},
	async execute() {
		const result = await get('/favorites/proposals');
		const parsed = proposalTemplatesSchema.safeParse(result);

		if (!parsed.success) {
			throwApiInvalidResponseError(parsed.error);
		}

		return JSON.stringify(parsed.data);
	},
};
