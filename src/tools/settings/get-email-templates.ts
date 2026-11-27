import type { Tool } from '../../core/tool.js';
import { emailTemplatesSchema } from '../../schemas/settings.js';
import { emptyObject as parameters } from '../../utils/schema.js';
import { throwApiInvalidResponseError } from '../../utils/errors.js';

export const getEmailTemplatesTool: Tool<typeof parameters> = {
	name: 'get_email_templates',
	description: 'Lists available email templates which are used to send proposals',
	parameters,
	annotations: {
		title: 'Get Email Templates',
		readOnlyHint: true,
		openWorldHint: true,
	},
	async execute(_args, { api }) {
		const result = await api.get('/settings/email-templates');
		const parsed = emailTemplatesSchema.safeParse(result);

		if (!parsed.success) {
			throwApiInvalidResponseError(parsed.error);
		}

		return JSON.stringify(parsed.data);
	},
};
