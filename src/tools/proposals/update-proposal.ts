import type { Tool } from '../../core/tool.js';
import { UserError } from '../../utils/errors.js';
import { z } from 'zod';
import { proposalDetailsSchema } from '../../schemas/proposals.js';
import { customFieldValuesSchema, tagsInputSchema } from '../../schemas/shared.js';

// A closed list: status, directory_id and content are never sent from this tool
const parameters = z.object({
	proposal_id: z.number(),
	name: z.string().optional(),
	account_user_id: z.number().optional().describe('The user who owns the proposal. See get_account_users'),
	contact_id: z.number().optional().describe('A new contact resets the receivers to the defaults of that contact. A won proposal cannot change contact'),
	contact_people: z.array(z.number()).optional().describe('Receivers: person ids of the organisation in contact_id. Each receiver needs an email address'),
	tags: tagsInputSchema.optional().describe('Replaces all tags. Strings create new tags, { id, name } objects assign existing tags. See get_tags'),
	custom_fields: customFieldValuesSchema.optional(),
	price_total: z.number().optional().describe('Manual total. It overrides the total from the price tables. A later price-table update clears it'),
	design_template_id: z.number().optional(),
	text_template_id: z.number().optional(),
});

export const updateProposalTool: Tool<typeof parameters> = {
	name: 'update_proposal',
	description:
		'Change proposal details: name, user, contact and receivers, tags, custom fields, manual total, design or text template. Only the sent fields change. On an open proposal the customer sees the change on the same link, so tell the user this and ask them to confirm first. To change tags or custom fields, read the current values with get_proposal_details first. The API saves the fields one by one, so after an error some fields can be saved: call get_proposal_details before you try again. Returns the proposal details after the change',
	parameters,
	annotations: {
		title: 'Update Proposal',
		readOnlyHint: false,
		destructiveHint: true,
		idempotentHint: true,
		openWorldHint: true,
	},
	async execute({ proposal_id, ...fields }, { api }) {
		if (Object.keys(fields).length === 0) {
			throw new UserError('No field to change was given. Nothing was sent.');
		}

		const url = `/proposals/${proposal_id}/details/`;
		await api.patch(url, fields);
		const details = await api.getAfterWrite(url, proposalDetailsSchema, 'The proposal change');

		return JSON.stringify(details);
	},
};
