import { z } from 'zod';

export const designTemplateSchema = z
	.object({
		id: z.number(),
		name: z.string(),
	})
	.passthrough();

export const designTemplatesSchema = z.array(designTemplateSchema);

export const emailTemplateSchema = z
	.object({
		id: z.number(),
		name: z.string(),
	})
	.passthrough();

export const emailTemplatesSchema = z.array(emailTemplateSchema);

export const textTemplateSchema = z
	.object({
		id: z.number(),
		name: z.string(),
	})
	.passthrough();

export const textTemplatesSchema = z.array(textTemplateSchema);

export const tagSchema = z
	.object({
		id: z.number(),
		name: z.string(),
	})
	.passthrough();

export const tagsSchema = z.array(tagSchema);
