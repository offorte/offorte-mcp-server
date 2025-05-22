import { type Tool } from 'fastmcp';
import { post } from '../../utils/requests.js';
import { contactCreateSchema } from '../../schemas/contacts.js';
import { throwApiInvalidResponseError } from '../../utils/errors.js';

const parameters = contactCreateSchema;

export const createContactTool: Tool<typeof parameters._type, typeof parameters> = {
	name: 'create_contact',
	description: 'Create a new contact (organisation or person/individual)',
	parameters,
	annotations: {
		title: 'Create Contact',
		openWorldHint: true,
	},
	async execute(params) {
		const parsed = contactCreateSchema.safeParse(params);

		if (!parsed.success) {
			throwApiInvalidResponseError(parsed.error);
		}

		const result = await post('/contacts/', parsed.data);
		return JSON.stringify(result);
	},
};
