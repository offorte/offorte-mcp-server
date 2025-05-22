import { type Tool } from 'fastmcp';
import { get } from '../../utils/requests.js';
import { emailTemplatesSchema } from '../../schemas/settings.js';
import { emptyObject as parameters } from '../../utils/schema.js';
import { throwApiInvalidResponseError } from '../../utils/errors.js';

export const getEmailTemplatesTool: Tool<undefined, typeof parameters> = {
	name: 'get_email_templates',
	description: 'Lists available email templates which are used to send proposals',
	parameters,
	annotations: {
		title: 'Get Email Templates',
		openWorldHint: true,
	},
	async execute() {
		const result = await get('/settings/email-templates');
		const parsed = emailTemplatesSchema.safeParse(result);

		if (!parsed.success) {
			throwApiInvalidResponseError(parsed.error);
		}

		return JSON.stringify(parsed.data);
	},
};
