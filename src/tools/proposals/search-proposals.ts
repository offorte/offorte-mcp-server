import type { Tool } from '../../core/tool.js';
import { z } from 'zod';
import { proposalsListSchema } from '../../schemas/proposals.js';
import { throwApiInvalidResponseError } from '../../utils/errors.js';

const parameters = z.object({
	search: z.string(),
});

export const searchProposalsTool: Tool<typeof parameters> = {
	name: 'search_proposals',
	description: 'Search for proposals by query',
	parameters,
	annotations: {
		title: 'Search Proposals',
		readOnlyHint: true,
		openWorldHint: true,
	},
	async execute({ search }, { api }) {
		const result = await api.get(`/proposals/open/?query=${encodeURIComponent(search)}`);
		const parsed = proposalsListSchema.safeParse(result);

		if (!parsed.success) {
			throwApiInvalidResponseError(parsed.error);
		}

		return JSON.stringify(parsed.data);
	},
};
