import type { Tool } from '../../core/tool.js';
import { z } from 'zod';
import { contactPeopleListSchema } from '../../schemas/contacts.js';
import { throwApiInvalidResponseError } from '../../utils/errors.js';

const parameters = z.object({
	search: z.string(),
});

export const searchContactPeopleTool: Tool<typeof parameters> = {
	name: 'search_contact_people',
	description: `Search for people by name in the contacts`,
	parameters,
	annotations: {
		title: 'Search Contact People',
		readOnlyHint: true,
		openWorldHint: true,
	},
	async execute({ search }, { api }) {
		const result = await api.get(`/contacts/people/?query=${encodeURIComponent(search)}`);
		const parsed = contactPeopleListSchema.safeParse(result);

		if (!parsed.success) {
			throwApiInvalidResponseError(parsed.error);
		}

		return JSON.stringify(parsed.data);
	},
};
