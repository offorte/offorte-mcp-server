import { z } from 'zod';
import { stringOrNumber } from '../utils/schema.js';

export const automationSetSchema = z.object({
	id: z.number(),
	name: stringOrNumber,
});

export const automationSetsSchema = z.array(automationSetSchema);
