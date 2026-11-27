import type { Tool } from '../../core/tool.js';
import { z } from 'zod';
import { contactDetailsSchema } from '../../schemas/contacts.js';
import { throwApiInvalidResponseError } from '../../utils/errors.js';

const parameters = z.object({
	contact_id: z.string(),
});

export const getContactDetailsTool: Tool<typeof parameters> = {
	name: 'get_contact_details',
	description: 'Get all details for a contact by id',
	parameters,
	annotations: {
		title: 'Get Contact Details',
		readOnlyHint: true,
		openWorldHint: true,
	},
	async execute({ contact_id }, { api }) {
		const result = await api.get(`/contacts/${contact_id}`);
		const parsed = contactDetailsSchema.safeParse(result);

		if (!parsed.success) {
			throwApiInvalidResponseError(parsed.error);
		}

		return JSON.stringify(parsed.data);
	},
};
