import { type Tool } from 'fastmcp';
import { get } from '../../utils/requests.js';
import { proposalDirectoriesSchema } from '../../schemas/proposals.js';
import { throwApiInvalidResponseError } from '../../utils/errors.js';
import { emptyObject as parameters } from '../../utils/schema.js';

export const getProposalDirectoriesTool: Tool<undefined, typeof parameters> = {
	name: 'get_proposal_directories',
	description: 'Get all proposal directories grouped by status (edit, open, won, lost, closed).',
	parameters,
	annotations: {
		title: 'Get Proposal Directories',
		openWorldHint: true,
	},
	async execute() {
		const result = await get('/proposal-directories/');
		const parsed = proposalDirectoriesSchema.safeParse(result);

		if (!parsed.success) {
			throwApiInvalidResponseError(parsed.error);
		}

		return JSON.stringify(parsed.data);
	},
};
