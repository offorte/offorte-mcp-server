import { z } from 'zod';
import { optionalId, stringOrNumber } from '../utils/schema.js';
import { contactType, proposalStatus } from './shared.js';

export const proposalListSchema = z
	.object({
		id: z.number(),
		name: z.string(),
		account_user_id: optionalId,
		contact_id: optionalId,
		contact_name: z.string().nullable().optional(),
		contact_person_fullname: z.string().nullable().optional(),
		contact_type: contactType.optional(),
		date_created: z.string(),
		date_modified: z.string().nullable().optional(),
		date_viewed: z.string().nullable().optional(),
		date_won: z.string().nullable().optional(),
		directory_id: optionalId,
		price_total: z.string(),
		proposal_nr: stringOrNumber,
		status: proposalStatus,
		total_price: z.string().nullable().optional(),
		total_price_override: z.string().nullable().optional(),
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
	discount_type: z.string().nullable().optional(),
	discount_value: z.number().nullable().optional(),
	hide_price: z.boolean().nullable().optional(),
	hide_quantity: z.boolean().nullable().optional(),
	price: z.number().nullable().optional(),
	product_id: z.number().nullable().optional(),
	quantity: z.number().nullable().optional(),
	recurring_include_in_totals: z.boolean().nullable().optional(),
	recurring_type: z.string().nullable().optional(),
	selectable: z.string().nullable().optional(),
	sku: z.union([z.string(), z.number()]).nullable().optional(),
	type: z.string(),
	unique_id: z.string().nullable().optional(),
	user_quantity: z.boolean().nullable().optional(),
	user_selected: z.boolean().nullable().optional(),
	vat_percentage: z.number().nullable().optional(),
});

export const proposalContentPricetableSchema = z.object({
	id: z.string(),
	rows: z.array(proposalContentRowSchema),
});

export const proposalContentSchema = z.object({
	pricetables: z.array(proposalContentPricetableSchema),
});

export const createProposalSchema = z.object({
	id: z.number(),
	version_id: z.number(),
});

export const sendProposalReceiverSchema = z.object({
	email: z.string(),
	fullname: z.string(),
	id: z.number(),
	proposal_link: z.string(),
});

export const sendProposalSchema = z.object({
	receivers: z.array(sendProposalReceiverSchema),
});
