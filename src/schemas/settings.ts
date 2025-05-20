import { z } from 'zod';
import { stringOrNumber } from '../utils/schema.js';

export const designTemplateSchema = z.object({
	id: z.number(),
	name: stringOrNumber,
});

export const designTemplatesSchema = z.array(designTemplateSchema);

export const emailTemplateSchema = z.object({
	id: z.number(),
	name: stringOrNumber,
});

export const emailTemplatesSchema = z.array(emailTemplateSchema);

export const textTemplateSchema = z.object({
	id: z.number(),
	name: stringOrNumber,
});

export const textTemplatesSchema = z.array(textTemplateSchema);
