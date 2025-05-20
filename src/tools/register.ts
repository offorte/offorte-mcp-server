import type { FastMCP } from 'fastmcp';
import { initialContextGuard } from './context/initial-context-guard.js';
import { getInitialContextTool } from './context/get-initial-context.js';
import { getProposalTemplatesTool } from './favorites/get-proposal-templates.js';
import { getAutomationSetsTool } from './automations/get-automation-sets.js';
import { getDesignTemplatesTool } from './settings/get-design-templates.js';
import { getEmailTemplatesTool } from './settings/get-email-templates.js';
import { getTextTemplatesTool } from './settings/get-text-templates.js';
import { getAccountUsersTool } from './account/get-users.js';

const tools = [
	getAccountUsersTool,
	getAutomationSetsTool,
	getDesignTemplatesTool,
	getEmailTemplatesTool,
	getInitialContextTool,
	getProposalTemplatesTool,
	getTextTemplatesTool,
];

export function registerTools({ server }: { server: FastMCP }) {
	tools.map(initialContextGuard).forEach((tool) => server.addTool(tool));
}
