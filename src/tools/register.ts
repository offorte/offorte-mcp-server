import type { FastMCP, Tool as FastMCPTool, ToolParameters } from 'fastmcp';
import { initialContextGuard } from './context/initial-context-guard.js';
import { getInitialContextTool } from './context/get-initial-context.js';
import { getProposalTemplatesTool } from './favorites/get-proposal-templates.js';
import { getAutomationSetsTool } from './automations/get-automation-sets.js';
import { getDesignTemplatesTool } from './settings/get-design-templates.js';
import { getEmailTemplatesTool } from './settings/get-email-templates.js';
import { getTextTemplatesTool } from './settings/get-text-templates.js';
import { getAccountUsersTool } from './account/get-users.js';
import { getContactDetailsTool } from './contacts/get-contact-details.js';
import { searchContactOrganisationsTool } from './contacts/search-contact-organisations.js';
import { searchContactPeopleTool } from './contacts/search-contact-people.js';
import { createContactTool } from './contacts/create-contact.js';
import { searchProposalsTool } from './proposals/search-proposals.js';
import { getProposalDetailsTool } from './proposals/get-proposal-details.js';
import { getProposalDirectoriesTool } from './proposals/get-proposal-directories.js';
import { createProposalTool } from './proposals/create-proposal.js';
import { copyProposalTool } from './proposals/copy-proposal.js';
import { sendProposalTool } from './proposals/send-proposal.js';
import { updateProposalPricetablesTool } from './proposals/update-proposal-pricetables.js';

const tools = [
	getInitialContextTool,
	getAccountUsersTool,
	getAutomationSetsTool,
	getContactDetailsTool,
	getDesignTemplatesTool,
	getEmailTemplatesTool,
	getProposalDetailsTool,
	getProposalDirectoriesTool,
	getProposalTemplatesTool,
	getTextTemplatesTool,
	searchContactOrganisationsTool,
	searchContactPeopleTool,
	searchProposalsTool,
	createContactTool,
	createProposalTool,
	copyProposalTool,
	sendProposalTool,
	updateProposalPricetablesTool,
];

export function registerTools({ server }: { server: FastMCP }) {
	(tools as unknown as FastMCPTool<Record<string, unknown>, ToolParameters>[]).map(initialContextGuard).forEach((tool) => server.addTool(tool));
}
