import { z } from 'zod';
import { stringOrNumber } from '../utils/schema.js';

export const customFieldSchema = z
	.object({
		label: stringOrNumber,
		name: stringOrNumber,
		required: z.boolean(),
		type: z.enum(['text', 'textarea', 'html']),
	})
	.passthrough();
