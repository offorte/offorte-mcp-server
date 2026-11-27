import type { Tool } from '../../core/tool.js';
import { z } from 'zod';
import { personSchema, personWriteSchema } from '../../schemas/contacts.js';
import { throwApiInvalidResponseError } from '../../utils/errors.js';

const parameters = z
	.object({ contact_id: z.number().describe('The organisation that the person joins') })
	.extend(personWriteSchema.shape)
	.extend({ name: z.string().describe('Full name of the person') });

export const createContactPersonTool: Tool<typeof parameters> = {
	name: 'create_contact_person',
	description:
		'Add a new person to an existing organisation. The new person id works as a receiver (contact_people) in create_proposal, copy_proposal and update_proposal. Returns the created person',
	parameters,
	annotations: {
		title: 'Create Contact Person',
		readOnlyHint: false,
		destructiveHint: false,
		idempotentHint: false,
		openWorldHint: true,
	},
	async execute({ contact_id, custom_fields, ...fields }, { api }) {
		const result = await api.post(`/contacts/${contact_id}/people/`, { ...fields, ...custom_fields });
		const parsed = personSchema.safeParse(result);

		if (!parsed.success) {
			return throwApiInvalidResponseError(parsed.error);
		}

		return JSON.stringify(parsed.data);
	},
};
