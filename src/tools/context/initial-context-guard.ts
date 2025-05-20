/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Tool as FastMCPTool, ToolParameters, Context } from 'fastmcp';

let initialContextSet = false;

export function initialContextGuard(tool: FastMCPTool<any, ToolParameters>): typeof tool {
	if (tool.name === 'get_initial_context') {
		return {
			...tool,
			execute: async (args: any, context: Context<any>) => {
				initialContextSet = true;
				return tool.execute(args, context);
			},
		};
	}
	return {
		...tool,
		execute: async (args: any, context: Context<any>) => {
			if (!initialContextSet) {
				throw new Error('Initial context has not been set. You must call get_initial_context before using this tool.');
			}
			return tool.execute(args, context);
		},
	};
}
