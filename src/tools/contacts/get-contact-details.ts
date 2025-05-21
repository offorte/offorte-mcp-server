import { type Tool } from 'fastmcp';
import { z } from 'zod';
import { get } from '../../utils/requests.js';
import { contactDetailsSchema } from '../../schemas/contacts.js';
import { throwApiInvalidResponseError } from '../../utils/errors.js';

const parameters = z.object({
	contact_id: z.string(),
});

export const getContactDetailsTool: Tool<{ contact_id: string }, typeof parameters> = {
	name: 'get_contact_details',
	description: 'Get all details for a contact by id.',
	parameters,
	annotations: {
		title: 'Get Contact Details',
		openWorldHint: true,
	},
	async execute({ contact_id }) {
		const result = await get(`/contacts/${contact_id}`);
		const parsed = contactDetailsSchema.safeParse(result);

		if (!parsed.success) {
			throwApiInvalidResponseError(parsed.error);
		}

		return JSON.stringify(parsed.data);
	},
};
