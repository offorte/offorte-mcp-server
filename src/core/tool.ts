import type { CallToolResult } from '@modelcontextprotocol/server';
import type { z } from 'zod';
import { UserError } from '../utils/errors.js';
import type { OfforteApi } from '../utils/requests.js';

export interface ToolContext {
	accountName: string;
	api: OfforteApi;
}

interface ReadToolAnnotations {
	title: string;
	readOnlyHint: true;
	openWorldHint: boolean;
	idempotentHint?: boolean;
	destructiveHint?: never;
}

interface WriteToolAnnotations {
	title: string;
	readOnlyHint: false;
	destructiveHint: boolean;
	openWorldHint: boolean;
	idempotentHint?: boolean;
}

export type ToolAnnotations = ReadToolAnnotations | WriteToolAnnotations;

export interface Tool<P extends z.ZodType<Record<string, unknown>> = z.ZodType<Record<string, unknown>>> {
	name: string;
	description: string;
	parameters: P;
	annotations: ToolAnnotations;
	execute(args: z.output<P>, context: ToolContext): Promise<string>;
}

function errorResult(toolName: string, error: unknown): CallToolResult {
	if (error instanceof UserError) {
		return {
			content: [{ type: 'text', text: error.message }],
			isError: true,
			...(error.extras ? { structuredContent: error.extras } : {}),
		};
	}

	const errorMessage = error instanceof Error ? error.message : String(error);
	return {
		content: [{ type: 'text', text: `Tool '${toolName}' execution failed: ${errorMessage}` }],
		isError: true,
	};
}

export async function runTool<P extends z.ZodType<Record<string, unknown>>>(tool: Tool<P>, args: z.output<P>, context: ToolContext): Promise<CallToolResult> {
	try {
		const text = await tool.execute(args, context);
		return { content: [{ type: 'text', text }] };
	} catch (error) {
		return errorResult(tool.name, error);
	}
}
