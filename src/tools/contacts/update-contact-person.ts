import type { Tool } from '../../core/tool.js';
import { z } from 'zod';
import { personSchema, personWriteSchema } from '../../schemas/contacts.js';

const parameters = z.object({ contact_id: z.number().describe('The organisation of the person'), person_id: z.number() }).extend(personWriteSchema.shape);

export const updateContactPersonTool: Tool<typeof parameters> = {
	name: 'update_contact_person',
	description:
		'Change a person of an organisation, for example to add the email address that a receiver needs. Only the sent fields change. An empty string clears a field, except email: an empty or invalid email makes the API save nothing from the call. To change tags or custom fields, read the current values with get_contact_details first. Returns the person after the change',
	parameters,
	annotations: {
		title: 'Update Contact Person',
		readOnlyHint: false,
		destructiveHint: true,
		idempotentHint: true,
		openWorldHint: true,
	},
	async execute({ contact_id, person_id, custom_fields, ...fields }, { api }) {
		const url = `/contacts/${contact_id}/people/${person_id}/`;
		await api.patch(url, { ...fields, ...custom_fields });
		const person = await api.getAfterWrite(url, personSchema, 'The person change');

		return JSON.stringify(person);
	},
};
