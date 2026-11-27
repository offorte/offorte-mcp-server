import { z } from 'zod';
import { stringOrNumber } from '../utils/schema.js';

export const designTemplateSchema = z
	.object({
		id: z.number(),
		name: z.string(),
	})
	.loose();

export const designTemplatesSchema = z.array(designTemplateSchema);

export const emailTemplateSchema = z
	.object({
		id: z.number(),
		name: z.string(),
	})
	.loose();

export const emailTemplatesSchema = z.array(emailTemplateSchema);

export const textTemplateSchema = z
	.object({
		id: z.number(),
		name: z.string(),
	})
	.loose();

export const textTemplatesSchema = z.array(textTemplateSchema);

export const tagSchema = z
	.object({
		id: z.number(),
		name: z.string(),
	})
	.loose();

export const tagsSchema = z.array(tagSchema);

export const vatGroupSchema = z
	.object({
		id: z.number(),
		label: z.string(),
		name: z.string(),
		// The VAT percentage as text, for example "21.00"
		vat: stringOrNumber,
	})
	.loose();

export const vatGroupsSchema = z.array(vatGroupSchema);
