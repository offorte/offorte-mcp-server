import { z } from 'zod';

export const automationSetSchema = z
	.object({
		id: z.number(),
		name: z.string(),
	})
	.passthrough();

export const automationSetsSchema = z.array(automationSetSchema);
