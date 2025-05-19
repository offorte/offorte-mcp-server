/* eslint-disable @typescript-eslint/no-explicit-any */
type Tool = {
	name: string;
	execute: (...args: any[]) => any;
	[key: string]: any;
};

let initialContextSet = false;

export function initialContextGuard<T extends Tool>(tool: T): T {
	if (tool.name === 'get_initial_context') {
		return {
			...tool,
			execute: async (...args: any[]) => {
				initialContextSet = true;
				return tool.execute(...args);
			},
		} as T;
	}
	return {
		...tool,
		execute: async (...args: any[]) => {
			if (!initialContextSet) {
				throw new Error('Initial context has not been set. You must call get_initial_context before using this tool.');
			}
			return tool.execute(...args);
		},
	} as T;
}
