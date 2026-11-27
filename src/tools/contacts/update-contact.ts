import type { Tool } from '../../core/tool.js';
import { z } from 'zod';
import { contactDetailsSchema, contactUpdateSchema } from '../../schemas/contacts.js';

const parameters = z.object({ contact_id: z.number() }).extend(contactUpdateSchema.shape);

export const updateContactTool: Tool<typeof parameters> = {
	name: 'update_contact',
	description:
		'Change an organisation or a person contact, for example its address or email address. Only the sent fields change. An empty string clears a field, except email: an empty or invalid email makes the API save nothing from the call. To change tags or custom fields, read the current values with get_contact_details first. Returns the contact details after the change',
	parameters,
	annotations: {
		title: 'Update Contact',
		readOnlyHint: false,
		destructiveHint: true,
		idempotentHint: true,
		openWorldHint: true,
	},
	async execute({ contact_id, custom_fields, ...fields }, { api }) {
		const url = `/contacts/${contact_id}/`;
		await api.patch(url, { ...fields, ...custom_fields });
		const contact = await api.getAfterWrite(url, contactDetailsSchema, 'The contact change');

		return JSON.stringify(contact);
	},
};
