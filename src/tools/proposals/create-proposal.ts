import { type Tool } from 'fastmcp';
import { post } from '../../utils/requests.js';
import { createProposalParametersSchema, createProposalResponseSchema } from '../../schemas/proposals.js';
import { throwApiInvalidResponseError } from '../../utils/errors.js';

export const createProposalTool: Tool<typeof createProposalParametersSchema._type, typeof createProposalParametersSchema> = {
	name: 'create_proposal',
	description: 'Create a new proposal.',
	parameters: createProposalParametersSchema,
	annotations: {
		title: 'Create Proposal',
		openWorldHint: true,
	},
	async execute(params) {
		const result = await post('/proposals/', params);
		const parsed = createProposalResponseSchema.safeParse(result);

		if (!parsed.success) {
			throwApiInvalidResponseError(parsed.error);
		}

		return JSON.stringify(parsed.data);
	},
};
