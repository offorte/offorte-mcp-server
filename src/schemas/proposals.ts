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
