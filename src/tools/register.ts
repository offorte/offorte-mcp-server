import type { FastMCP } from 'fastmcp';
import { initialContextGuard } from './context/initial-context-guard.js';
import { getInitialContextTool } from './context/get-initial-context.js';
import { getProposalTemplatesTool } from './favorites/get-proposal-templates.js';
import { getAutomationSetsTool } from './automations/get-automation-sets.js';

const tools = [getInitialContextTool, getProposalTemplatesTool, getAutomationSetsTool];

export function registerTools({ server }: { server: FastMCP }) {
	tools.map(initialContextGuard).forEach((tool) => server.addTool(tool));
}
