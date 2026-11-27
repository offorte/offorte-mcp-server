import type { Tool } from '../../core/tool.js';
import { z } from 'zod';
import { proposalsListSchema } from '../../schemas/proposals.js';
import { proposalStatus } from '../../schemas/shared.js';
import { throwApiInvalidResponseError } from '../../utils/errors.js';

const parameters = z.object({
	status: proposalStatus,
	directory_id: z.number().int().positive().optional().describe('Only list this directory. See get_proposal_directories'),
	sort: z
		.enum(['name', 'date_created', 'date_modified', 'date_openclient'])
		.optional()
		.describe(
			'Sort order. Default: name. date_created sorts on the date of the current version, newest first. A proposal that got a new version moves up, so the order can differ from the date_created field in the result. To find the newest proposals, compare that field',
		),
	page: z.number().int().min(1).optional().describe('Page number, starting at 1'),
});

export const listProposalsTool: Tool<typeof parameters> = {
	name: 'list_proposals',
	description:
		'List proposals by status, optionally of one directory. Without directory_id the list holds every proposal of that status, also the ones in directories. A page has at most 50 proposals. A page with fewer than 50 is the last page. Deleted proposals are not listed',
	parameters,
	annotations: {
		title: 'List Proposals',
		readOnlyHint: true,
		openWorldHint: true,
	},
	async execute({ status, directory_id, sort, page }, { api }) {
		const url = directory_id ? `/proposals/${status}/${directory_id}/` : `/proposals/${status}/`;
		const result = await api.get(url, { params: { sort, page } });
		const parsed = proposalsListSchema.safeParse(result);

		if (!parsed.success) {
			return throwApiInvalidResponseError(parsed.error);
		}

		return JSON.stringify(parsed.data);
	},
};
