import type { Tool } from '../../core/tool.js';
import { proposalDirectoriesSchema } from '../../schemas/proposals.js';
import { throwApiInvalidResponseError } from '../../utils/errors.js';
import { emptyObject as parameters } from '../../utils/schema.js';

export const getProposalDirectoriesTool: Tool<typeof parameters> = {
	name: 'get_proposal_directories',
	description: 'Get all proposal directories grouped by status (edit, open, won, lost, closed)',
	parameters,
	annotations: {
		title: 'Get Proposal Directories',
		readOnlyHint: true,
		openWorldHint: true,
	},
	async execute(_args, { api }) {
		const result = await api.get('/proposal-directories/');
		const parsed = proposalDirectoriesSchema.safeParse(result);

		if (!parsed.success) {
			throwApiInvalidResponseError(parsed.error);
		}

		return JSON.stringify(parsed.data);
	},
};
