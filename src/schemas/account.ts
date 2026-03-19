import { z } from 'zod';

export const accountUserSchema = z
	.object({
		id: z.number(),
		email: z.string(),
		firstname: z.string(),
		lastname: z.string(),
		phone: z.string().nullable(),
		jobtitle: z.string().nullable(),
		date_lastlogin: z.string(),
	})
	.passthrough();

export const accountUsersSchema = z.array(accountUserSchema);
