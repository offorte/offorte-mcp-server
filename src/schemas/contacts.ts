import { z } from 'zod';
import { optionalId } from '../utils/schema.js';
import { tagsSchema } from './settings.js';
import { proposalsListSchema } from './proposals.js';
import { contactType } from './shared.js';

const addressFields = {
	city: z.string().nullable().optional(),
	country: z.string().nullable().optional(),
	state: z.string().nullable().optional(),
	street: z.string().nullable().optional(),
	zipcode: z.string().nullable().optional(),
};

const socialFields = {
	facebook: z.string().nullable().optional(),
	instagram: z.string().nullable().optional(),
	internet: z.string().nullable().optional(),
	linkedin: z.string().nullable().optional(),
	twitter: z.string().nullable().optional(),
};

const contactFields = {
	email: z.string().nullable().optional(),
	phone: z.string().nullable().optional(),
	mobile: z.string().nullable().optional(),
	fax: z.string().nullable().optional(),
};

const personFields = {
	firstname: z.string().nullable().optional(),
	lastname: z.string().nullable().optional(),
	fullname: z.string().nullable().optional(),
	salutation: z.string().nullable().optional(),
	total_proposals: z.number().nullable().optional(),
};

const organisationFields = {
	name: z.string(),
	coc_number: z.string().nullable().optional(),
	vat_number: z.string().nullable().optional(),
	account_user_id: optionalId,
	account_user_name: z.string().nullable().optional(),
	date_created: z.string(),
	proposals_open: z.number().nullable().optional(),
	proposals_won: z.number().nullable().optional(),
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
		account_user_name: z.string().nullable().optional(),
		organisation: z.string(),
		date_created: z.string(),
		proposals_open: z.number().nullable().optional(),
		proposals_won: z.number().nullable().optional(),
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
