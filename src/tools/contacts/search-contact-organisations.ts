import type { Tool } from '../../core/tool.js';
import { z } from 'zod';
import { contactOrganisationsListSchema } from '../../schemas/contacts.js';
import { throwApiInvalidResponseError } from '../../utils/errors.js';

const parameters = z.object({
	search: z.string(),
});

export const searchContactOrganisationsTool: Tool<typeof parameters> = {
	name: 'search_contact_organisations',
	description: 'Search for organisations by name in the contacts',
	parameters,
	annotations: {
		title: 'Search Contact Organisations',
		readOnlyHint: true,
		openWorldHint: true,
	},
	async execute({ search }, { api }) {
		const result = await api.get(`/contacts/organisations/?query=${encodeURIComponent(search)}`);
		const parsed = contactOrganisationsListSchema.safeParse(result);

		if (!parsed.success) {
			throwApiInvalidResponseError(parsed.error);
		}

		return JSON.stringify(parsed.data);
	},
};
