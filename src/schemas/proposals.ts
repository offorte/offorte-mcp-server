import { z } from 'zod';
import { optionalId, stringOrNumber } from '../utils/schema.js';
import { contactType, proposalStatus } from './shared.js';

export const proposalListSchema = z
	.object({
		id: z.number(),
		name: z.string(),
		account_user_id: optionalId,
		contact_id: optionalId,
		contact_name: z.string().optional(),
		contact_person_fullname: z.string().nullable().optional(),
		contact_type: contactType.optional(),
		date_created: z.string(),
		date_modified: z.string().optional(),
		date_viewed: z.string().optional(),
		date_won: z.string().optional(),
		directory_id: optionalId,
		price_total: z.string(),
		proposal_nr: stringOrNumber,
		status: proposalStatus,
		total_price: z.string().optional(),
		total_price_override: z.string().optional(),
		version_id: z.number(),
	})
	.passthrough();

export const proposalsListSchema = z.array(proposalListSchema);

export const proposalDirectorySchema = z.object({
	id: z.number(),
	name: z.string(),
});

export const proposalDirectoriesSchema = z.object({
	closed: z.array(proposalDirectorySchema).optional(),
	edit: z.array(proposalDirectorySchema).optional(),
	lost: z.array(proposalDirectorySchema).optional(),
	open: z.array(proposalDirectorySchema).optional(),
	won: z.array(proposalDirectorySchema).optional(),
});

export const proposalContentRowSchema = z.object({
	content: z.string(),
	discount_type: z.string().optional(),
	discount_value: z.number().optional(),
	hide_price: z.boolean().optional(),
	hide_quantity: z.boolean().optional(),
	price: z.number().optional(),
	product_id: z.number().optional(),
	quantity: z.number().optional(),
	recurring_include_in_totals: z.boolean().optional(),
	recurring_type: z.string().optional(),
	selectable: z.string().optional(),
	sku: z.union([z.string(), z.number()]).optional(),
	type: z.string(),
	unique_id: z.string().optional(),
	user_quantity: z.boolean().optional(),
	user_selected: z.boolean().optional(),
	vat_percentage: z.number().optional(),
});

export const proposalContentPricetableSchema = z.object({
	id: z.string(),
	rows: z.array(proposalContentRowSchema),
});

export const proposalContentSchema = z.object({
	pricetables: z.array(proposalContentPricetableSchema),
});

export const createProposalParametersSchema = z.object({
	account_user_id: z.number().optional(),
	contact_id: z.number(),
	contact_people: z.array(z.number()),
	design_template_id: z.number(),
	name: z.string(),
	proposal_template_id: z.number(),
	text_template_id: z.number(),
	custom_fields: z.array(z.object({ name: z.string(), value: z.string() })).optional(),
	// automations_set_id: z.number().optional(),
	// content: proposalContentSchema.optional(),
	// directory_id: z.number().optional(),
	// tags: z.array(z.union([z.string(), z.object({ id: z.number(), name: z.string() })])).optional(),
});

export const createProposalResponseSchema = z.object({
	id: z.number(),
	version_id: z.number(),
});
