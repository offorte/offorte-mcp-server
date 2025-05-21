import { type Tool } from 'fastmcp';
import { z } from 'zod';
import { get } from '../../utils/requests.js';
import { proposalsListSchema } from '../../schemas/proposals.js';
import { throwApiInvalidResponseError } from '../../utils/errors.js';

const parameters = z.object({
	search: z.string(),
});

export const searchProposalsTool: Tool<{ search: string }, typeof parameters> = {
	name: 'search_proposals',
	description: 'Search for proposals by name or query.',
	parameters,
	annotations: {
		title: 'Search Proposals',
		openWorldHint: true,
	},
	async execute({ search }) {
		const result = await get(`/proposals/open/?query=${encodeURIComponent(search)}`);
		const parsed = proposalsListSchema.safeParse(result);

		if (!parsed.success) {
			throwApiInvalidResponseError(parsed.error);
		}

		return JSON.stringify(parsed.data);
	},
};
