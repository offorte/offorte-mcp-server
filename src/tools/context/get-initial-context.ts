import type { Tool } from 'fastmcp';
import { outdent } from 'outdent';
import { config } from '../../config/offorte.js';
import { INSTRUCTIONS } from '../../instructions.js';
import { emptyObject as parameters } from '../../utils/schema.js';

export const getInitialContextTool: Tool<undefined, typeof parameters> = {
	name: 'get_initial_context',
	description: `IMPORTANT: This tool must be called before using any other tools. It will get usage instructions & Offorte context for this MCP server.`,
	parameters,
	annotations: {
		title: 'Get MCP Server Instructions',
		openWorldHint: false,
	},
	async execute() {
		const currentDate = new Date().toLocaleDateString('en-US');

		const context = outdent`
            ${INSTRUCTIONS}

            Context for your Offorte instance:

			<context>
			    Account Name: ${config.accountName}
			    Date today: ${currentDate}
			</content>
	  `;

		return context;
	},
};
