import type { Tool } from '../../core/tool.js';
import { proposalTemplatesSchema } from '../../schemas/favorites.js';
import { emptyObject as parameters } from '../../utils/schema.js';
import { throwApiInvalidResponseError } from '../../utils/errors.js';

export const getProposalTemplatesTool: Tool<typeof parameters> = {
	name: 'get_proposal_templates',
	description: `Lists proposal templates which are used as starting points to create new proposals`,
	parameters,
	annotations: {
		title: 'Get Proposal Templates',
		readOnlyHint: true,
		openWorldHint: true,
	},
	async execute(_args, { api }) {
		const result = await api.get('/favorites/proposals');
		const parsed = proposalTemplatesSchema.safeParse(result);

		if (!parsed.success) {
			throwApiInvalidResponseError(parsed.error);
		}

		return JSON.stringify(parsed.data);
	},
};
