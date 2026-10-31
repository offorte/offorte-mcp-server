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

// The API uses false for an unset row option, for example selectable: false
const falseOrString = z.union([z.literal(false), z.string()]);

// Proposal details returns some row numbers as text, for example discount_value: "10", and an unset number as "".
// Accept a row copied from details as it is, so a full-row update does not fail on these values.
const numberOrText = z.union([
	z.number(),
	z.literal(''),
	z
		.string()
		.regex(/^-?\d+(\.\d+)?$/)
		.transform(Number),
]);

// Proposal details casts every id and *_id value: "" becomes null and numeric text becomes a number, for example "2024" becomes 2024.
// Turn it back into the text that the Editor stored.
const uniqueIdText = stringOrNumber.nullable().transform((id) => (id === null ? '' : String(id)));

export const proposalContentRowSchema = z.object({
	content: z.string(),
	discount_type: falseOrString.nullable().optional(),
	discount_value: numberOrText.nullable().optional(),
	hide_price: z.boolean().nullable().optional(),
	hide_quantity: z.boolean().nullable().optional(),
	price: z.number().nullable().optional(),
	product_id: numberOrText.nullable().optional(),
	quantity: z.number().nullable().optional(),
	recurring_include_in_totals: z.boolean().nullable().optional(),
	recurring_type: falseOrString.nullable().optional(),
	selectable: falseOrString.nullable().optional(),
	sku: z.union([z.string(), z.number()]).nullable().optional(),
	type: z.string(),
	unique_id: uniqueIdText.optional(),
	user_quantity: z.boolean().nullable().optional(),
	user_selected: z.boolean().nullable().optional(),
	// null means the table default VAT. Proposal details returns the stored -1 as null, but a write only accepts -1.
	vat_percentage: z
		.number()
		.nullable()
		.optional()
		.transform((value) => (value === null ? -1 : value)),
});

export const proposalContentPricetableSchema = z.object({
	// A table without a Unique ID has id "" in get_proposal_details. It cannot be targeted.
	id: z.string().min(1),
	rows: z.array(proposalContentRowSchema),
});

export const proposalContentSchema = z.object({
	pricetables: z.array(proposalContentPricetableSchema),
});

// The details read differs from the write shape: rows also carry id and subtotal, and some values come back as text
export const proposalDetailsPricetableSchema = z
	.object({
		// The table Unique ID, as text. A table without a Unique ID gets "".
		id: uniqueIdText,
		rows: z.array(z.object({ type: z.string() }).passthrough()),
	})
	.passthrough();

export const proposalDetailsSchema = z
	.object({
		id: z.number(),
		name: z.string(),
		status: proposalStatus,
		price_total: z.string(),
		content: z
			.union([
				z.object({ pricetables: z.array(proposalDetailsPricetableSchema) }),
				// The API returns an empty list when the proposal has no price tables
				z.tuple([]),
			])
			.transform((content) => (Array.isArray(content) ? { pricetables: [] } : content)),
	})
	.passthrough();

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
