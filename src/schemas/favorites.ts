import { z } from 'zod';
import { customFieldSchema } from './shared.js';
import { optionalId } from '../utils/schema.js';

export const proposalTemplateSchema = z
	.object({
		automations_set_id: optionalId,
		custom_fields: z.array(customFieldSchema).optional(),
		design_template_id: optionalId,
		id: z.number(),
		name: z.string(),
		text_template_id: optionalId,
	})
	.passthrough();

export const proposalTemplatesSchema = z.array(proposalTemplateSchema);
