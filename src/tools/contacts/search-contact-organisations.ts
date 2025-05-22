import { type Tool } from 'fastmcp';
import { z } from 'zod';
import { get } from '../../utils/requests.js';
import { contactOrganisationsListSchema } from '../../schemas/contacts.js';
import { throwApiInvalidResponseError } from '../../utils/errors.js';

const parameters = z.object({
	search: z.string(),
});

export const searchContactOrganisationsTool: Tool<typeof parameters._type, typeof parameters> = {
	name: 'search_contact_organisations',
	description: 'Search for organisations by name in the contacts',
	parameters,
	annotations: {
		title: 'Search Contact Organisations',
		openWorldHint: true,
	},
	async execute({ search }) {
		const result = await get(`/contacts/organisations/?query=${encodeURIComponent(search)}`);
		const parsed = contactOrganisationsListSchema.safeParse(result);

		if (!parsed.success) {
			throwApiInvalidResponseError(parsed.error);
		}

		return JSON.stringify(parsed.data);
	},
};
