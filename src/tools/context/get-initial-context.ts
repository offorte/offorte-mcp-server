import type { Tool } from '../../core/tool.js';
import { outdent } from 'outdent';
import { INSTRUCTIONS } from '../../instructions.js';
import { emptyObject as parameters } from '../../utils/schema.js';

export const getInitialContextTool: Tool<typeof parameters> = {
	name: 'get_initial_context',
	description: `IMPORTANT: Call this tool once at the start of each conversation, before any other tool. It returns the usage instructions and the Offorte account context.`,
	parameters,
	annotations: {
		title: 'Get MCP Server Instructions',
		readOnlyHint: true,
		openWorldHint: false,
	},
	async execute(_args, { accountName }) {
		const currentDate = new Date().toLocaleDateString('en-US');

		const context = outdent`
			${INSTRUCTIONS}

			Context for your Offorte instance:

			<context>
			    Account Name: ${accountName}
			    Date today: ${currentDate}
			</context>
		`;

		return context;
	},
};
