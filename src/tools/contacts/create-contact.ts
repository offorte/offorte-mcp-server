import type { Tool } from '../../core/tool.js';
import { contactCreateSchema } from '../../schemas/contacts.js';
import { throwApiInvalidResponseError } from '../../utils/errors.js';

const parameters = contactCreateSchema;

export const createContactTool: Tool<typeof parameters> = {
	name: 'create_contact',
	description:
		'Create a new contact (organisation or person/individual). Search with search_contact_organisations or search_contact_people first. When the contact exists, ask the user whether to use it instead',
	parameters,
	annotations: {
		title: 'Create Contact',
		readOnlyHint: false,
		destructiveHint: false,
		idempotentHint: false,
		openWorldHint: true,
	},
	async execute(params, { api }) {
		const parsed = contactCreateSchema.safeParse(params);

		if (!parsed.success) {
			throwApiInvalidResponseError(parsed.error);
		}

		const result = await api.post('/contacts/', parsed.data);
		return JSON.stringify(result);
	},
};
