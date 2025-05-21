import { type Tool } from 'fastmcp';
import { z } from 'zod';
import { get } from '../../utils/requests.js';
import { contactPeopleListSchema } from '../../schemas/contacts.js';
import { throwApiInvalidResponseError } from '../../utils/errors.js';

const parameters = z.object({
	search: z.string(),
});

export const searchContactPeopleTool: Tool<{ search: string }, typeof parameters> = {
	name: 'search_contact_people',
	description: `Search for people by name in the contacts directory.`,
	parameters,
	annotations: {
		title: 'Search Contact People',
		openWorldHint: true,
	},
	async execute({ search }) {
		const result = await get(`/contacts/people/?query=${encodeURIComponent(search)}`);
		const parsed = contactPeopleListSchema.safeParse(result);

		if (!parsed.success) {
			throwApiInvalidResponseError(parsed.error);
		}

		return JSON.stringify(parsed.data);
	},
};
