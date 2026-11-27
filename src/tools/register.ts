import type { McpServer } from '@modelcontextprotocol/server';
import { runTool, type Tool } from '../core/tool.js';
import { createOfforteApi, type OfforteCredentials } from '../utils/requests.js';
import { createInitialContextGuard } from './context/initial-context-guard.js';
import { getInitialContextTool } from './context/get-initial-context.js';
import { getProposalTemplatesTool } from './favorites/get-proposal-templates.js';
import { getAutomationSetsTool } from './automations/get-automation-sets.js';
import { getDesignTemplatesTool } from './settings/get-design-templates.js';
import { getEmailTemplatesTool } from './settings/get-email-templates.js';
import { getTextTemplatesTool } from './settings/get-text-templates.js';
import { getVatGroupsTool } from './settings/get-vat-groups.js';
import { getTagsTool } from './settings/get-tags.js';
import { getAccountUsersTool } from './account/get-users.js';
import { getContactDetailsTool } from './contacts/get-contact-details.js';
import { searchContactOrganisationsTool } from './contacts/search-contact-organisations.js';
import { searchContactPeopleTool } from './contacts/search-contact-people.js';
import { createContactTool } from './contacts/create-contact.js';
import { createContactPersonTool } from './contacts/create-contact-person.js';
import { updateContactTool } from './contacts/update-contact.js';
import { updateContactPersonTool } from './contacts/update-contact-person.js';
import { searchProposalsTool } from './proposals/search-proposals.js';
import { listProposalsTool } from './proposals/list-proposals.js';
import { getProposalDetailsTool } from './proposals/get-proposal-details.js';
import { getProposalDirectoriesTool } from './proposals/get-proposal-directories.js';
import { createProposalTool } from './proposals/create-proposal.js';
import { copyProposalTool } from './proposals/copy-proposal.js';
import { sendProposalTool } from './proposals/send-proposal.js';
import { updateProposalPricetablesTool } from './proposals/update-proposal-pricetables.js';
import { updateProposalTool } from './proposals/update-proposal.js';
import { updateProposalStatusTool } from './proposals/update-proposal-status.js';
import { deleteProposalTool } from './proposals/delete-proposal.js';
import { getProductDirectoriesTool } from './products/get-product-directories.js';
import { getProductsTool } from './products/get-products.js';
import { createProductTool } from './products/create-product.js';
import { updateProductTool } from './products/update-product.js';
import { createProductDirectoryTool } from './products/create-product-directory.js';
import { updateProductDirectoryTool } from './products/update-product-directory.js';

const tools: Tool[] = [
	getInitialContextTool,
	getAccountUsersTool,
	getAutomationSetsTool,
	getContactDetailsTool,
	getDesignTemplatesTool,
	getEmailTemplatesTool,
	getProposalDetailsTool,
	getProposalDirectoriesTool,
	getProposalTemplatesTool,
	getProductDirectoriesTool,
	getProductsTool,
	getTagsTool,
	getTextTemplatesTool,
	getVatGroupsTool,
	listProposalsTool,
	searchContactOrganisationsTool,
	searchContactPeopleTool,
	searchProposalsTool,
	createContactTool,
	createContactPersonTool,
	createProductTool,
	createProductDirectoryTool,
	createProposalTool,
	copyProposalTool,
	sendProposalTool,
	updateContactTool,
	updateContactPersonTool,
	updateProductTool,
	updateProductDirectoryTool,
	updateProposalTool,
	updateProposalPricetablesTool,
	updateProposalStatusTool,
	deleteProposalTool,
];

export interface RegisterToolsOptions {
	server: McpServer;
	credentials: OfforteCredentials;
	apiHost: string;
	apiTimeoutMs: number;
	guard: boolean;
}

export function registerTools({ server, credentials, apiHost, apiTimeoutMs, guard }: RegisterToolsOptions) {
	const guardTool = guard ? createInitialContextGuard() : (tool: Tool) => tool;

	for (const tool of tools.map(guardTool)) {
		server.registerTool(
			tool.name,
			{
				title: tool.annotations.title,
				description: tool.description,
				inputSchema: tool.parameters,
				annotations: tool.annotations,
			},
			(args, ctx) => {
				const api = createOfforteApi({ ...credentials, apiHost, timeoutMs: apiTimeoutMs, signal: ctx.mcpReq.signal });
				return runTool(tool, args, { accountName: credentials.accountName, api });
			},
		);
	}
}
