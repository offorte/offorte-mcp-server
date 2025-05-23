import { z } from 'zod';
import { optionalId } from '../utils/schema.js';
import { tagsSchema } from './settings.js';
import { proposalsListSchema } from './proposals.js';
import { contactType } from './shared.js';

const addressFields = {
	city: z.string().optional(),
	country: z.string().optional(),
	state: z.string().optional(),
	street: z.string().optional(),
	zipcode: z.string().optional(),
};

const socialFields = {
	facebook: z.string().optional(),
	instagram: z.string(),
	internet: z.string(),
	linkedin: z.string(),
	twitter: z.string(),
};

const contactFields = {
	email: z.string().optional(),
	phone: z.string().optional(),
	mobile: z.string().optional(),
	fax: z.string().optional(),
};

const personFields = {
	firstname: z.string().optional(),
	lastname: z.string().optional(),
	fullname: z.string().optional(),
	salutation: z.string().optional(),
	total_proposals: z.number().optional(),
};

const organisationFields = {
	name: z.string(),
	coc_number: z.string().optional(),
	vat_number: z.string().optional(),
	account_user_id: optionalId,
	account_user_name: z.string().optional(),
	date_created: z.string(),
	proposals_open: z.number().optional(),
	proposals_won: z.number().optional(),
	people: z.array(z.lazy(() => personSchema)).optional(),
	type: contactType,
};

/**
 * Schemas
 */
const personSchema = z
	.object({
		id: z.number(),
		...addressFields,
		...socialFields,
		...contactFields,
		...personFields,
	})
	.passthrough();

const organisationSchema = z
	.object({
		id: z.number(),
		...addressFields,
		...socialFields,
		...contactFields,
		...organisationFields,
	})
	.passthrough();

export const contactOrganisationsListSchema = z.array(organisationSchema);

const personOrOrganisationSchema = z
	.object({
		id: z.number(),
		contact_id: optionalId,
		type: contactType,
		account_user_id: optionalId,
		account_user_name: z.string().optional(),
		organisation: z.string(),
		date_created: z.string(),
		proposals_open: z.number().optional(),
		proposals_won: z.number().optional(),
		...addressFields,
		...socialFields,
		...contactFields,
		firstname: z.string(),
		lastname: z.string(),
		fullname: z.string(),
		salutation: z.string(),
	})
	.passthrough();

export const contactPeopleListSchema = z.array(personOrOrganisationSchema);

export const contactDetailsSchema = z
	.object({
		id: z.number(),
		...addressFields,
		...socialFields,
		...contactFields,
		...organisationFields,
		people: z.array(personSchema).optional(),
		proposals: proposalsListSchema.optional(),
		tags: tagsSchema.optional(),
	})
	.passthrough();

/**
 * Create contact schema
 */
export const contactCreateSchema = z
	.object({
		type: contactType,
		name: z.string(),
		street: z.string().optional(),
		zipcode: z.string().optional(),
		city: z.string().optional(),
		state: z.string().optional(),
		country: z.string().optional(),
		phone: z.string().optional(),
		email: z.string().optional(),
		internet: z.string().optional(),
		linkedin: z.string().optional(),
		facebook: z.string().optional(),
		twitter: z.string().optional(),
		instagram: z.string().optional(),
		coc_number: z.string().optional(),
		vat_number: z.string().optional(),
		tags: tagsSchema.optional(),
		firstname: z.string().optional(),
		lastname: z.string().optional(),
		salutation: z.string().optional(),
		mobile: z.string().optional(),
	})
	.passthrough();
