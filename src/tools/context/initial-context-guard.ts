import type { Tool } from '../../core/tool.js';

/**
 * Makes every tool except get_initial_context fail until get_initial_context has run.
 * Create one guard per server instance, so the state belongs to one connection.
 */
export function createInitialContextGuard() {
	let initialContextSet = false;

	return function initialContextGuard(tool: Tool): Tool {
		if (tool.name === 'get_initial_context') {
			return {
				...tool,
				execute: async (args, context) => {
					initialContextSet = true;
					return tool.execute(args, context);
				},
			};
		}
		return {
			...tool,
			execute: async (args, context) => {
				if (!initialContextSet) {
					throw new Error('Initial context has not been set. You must call get_initial_context before using this tool.');
				}
				return tool.execute(args, context);
			},
		};
	};
}
