import { z } from 'zod';
import { falseOrString, stringOrNumber } from '../utils/schema.js';

export const productDirectorySchema = z
	.object({
		id: z.number(),
		name: z.string(),
	})
	.loose();

export const productDirectoriesSchema = z.array(productDirectorySchema);

export const productSchema = z
	.object({
		id: z.number(),
		name: z.string(),
		descr_short: z.string().nullable(),
		price: stringOrNumber,
		vat_id: z.number(),
		vat_percentage: stringOrNumber,
		sku: stringOrNumber.nullable(),
		selectable: falseOrString,
		recurring: falseOrString,
	})
	.loose();

export const productsSchema = z.array(productSchema);

// At the plan's product limit, the API answers with a success status and creates nothing
export const createProductSchema = z.union([z.object({ product_id: z.number() }), z.object({ total: z.literal('maximum_reached') })]);

// Write values. false means off, as get_products returns it.
export const productSelectable = z.union([z.literal(false), z.enum(['check', 'radio'])]);
export const productRecurring = z.union([z.literal(false), z.enum(['month', 'year'])]);
