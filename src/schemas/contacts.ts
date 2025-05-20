import { z } from 'zod';
import { numberOrEmptyString, stringOrNumber } from '../utils/schema.js';
import { tagsSchema } from './settings.js';

const contactType = z.enum(['organisation', 'person']);

const personSchema = z
	.object({
		city: stringOrNumber,
		country: stringOrNumber,
		email: stringOrNumber,
		facebook: stringOrNumber,
		firstname: stringOrNumber,
		fullname: stringOrNumber,
		id: z.number(),
		instagram: stringOrNumber,
		internet: stringOrNumber,
		lastname: stringOrNumber,
		linkedin: stringOrNumber,
		mobile: stringOrNumber,
		phone: stringOrNumber,
		salutation: stringOrNumber,
		state: stringOrNumber,
		street: stringOrNumber,
		total_proposals: z.number(),
		twitter: stringOrNumber,
		zipcode: stringOrNumber,
	})
	.passthrough();

const proposalSchema = z
	.object({
		account_user_id: z.number(),
		contact_name: stringOrNumber,
		contact_person_fullname: stringOrNumber,
		date_created: stringOrNumber,
		id: z.number(),
		name: stringOrNumber,
		price_total: stringOrNumber,
		proposal_nr: stringOrNumber,
		status: stringOrNumber,
		total_price: z.number(),
		total_price_override: stringOrNumber,
		version_id: z.number(),
		directory_id: stringOrNumber,
		date_modified: stringOrNumber,
		date_viewed: stringOrNumber,
		date_won: stringOrNumber,
		date_modified_display: z.union([z.string(), z.boolean()]),
		date_viewed_display: z.union([z.string(), z.boolean()]),
		date_won_display: z.union([z.string(), z.boolean()]),
		tags: z.array(z.any()),
	})
	.passthrough();

export const contactDetailsSchema = z
	.object({
		account_user_id: numberOrEmptyString,
		account_user_name: stringOrNumber.optional(),
		city: stringOrNumber,
		coc_number: stringOrNumber,
		country: stringOrNumber,
		date_created: stringOrNumber,
		email: stringOrNumber,
		facebook: stringOrNumber,
		fax: stringOrNumber,
		id: z.number(),
		instagram: stringOrNumber,
		internet: stringOrNumber,
		linkedin: stringOrNumber,
		name: stringOrNumber,
		people: z.array(personSchema),
		phone: stringOrNumber,
		proposals: z.array(proposalSchema),
		state: stringOrNumber,
		street: stringOrNumber,
		tags: tagsSchema,
		twitter: stringOrNumber,
		type: contactType,
		vat_number: stringOrNumber,
		zipcode: stringOrNumber,
	})
	.passthrough();
