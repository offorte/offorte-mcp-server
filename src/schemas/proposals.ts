import { z } from 'zod';

export const customFieldSchema = z.object({
	label: z.string(),
	name: z.string(),
	required: z.boolean(),
	type: z.enum(['text', 'textarea', 'html']),
});
