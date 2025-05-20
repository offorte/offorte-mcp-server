import { z } from 'zod';
import { stringOrNumber } from '../utils/schema.js';

export const accountUserSchema = z
	.object({
		id: z.number(),
		email: z.string(),
		firstname: stringOrNumber,
		lastname: stringOrNumber,
		phone: stringOrNumber,
		jobtitle: stringOrNumber,
		date_lastlogin: stringOrNumber,
	})
	.passthrough();

export const accountUsersSchema = z.array(accountUserSchema);
