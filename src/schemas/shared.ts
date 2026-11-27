import { z } from 'zod';

export const contactType = z.enum(['organisation', 'person']);
export const proposalStatus = z.enum(['edit', 'open', 'won', 'lost', 'closed']);

export const customFieldSchema = z
	.object({
		label: z.string(),
		name: z.string(),
		required: z.boolean(),
		type: z.enum(['text', 'textarea', 'html']),
	})
	.loose();

export const tagsInputSchema = z.array(z.union([z.string(), z.object({ id: z.number(), name: z.string() })]));

// Proposal custom field values
export const customFieldValuesSchema = z.array(z.object({ name: z.string(), value: z.string() }));
