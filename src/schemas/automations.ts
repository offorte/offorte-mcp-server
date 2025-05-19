import { z } from 'zod';

export const automationSetSchema = z.object({
	id: z.number(),
	name: z.string(),
});

export const automationSetsSchema = z.array(automationSetSchema);
