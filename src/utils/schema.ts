import { z } from 'zod';

export const emptyObject = z.object({});
export const optionalId = z.union([z.number(), z.literal(false), z.null()]).optional();
export const stringOrNumber = z.union([z.number(), z.string()]);
export const numberOrEmptyString = z.union([z.number(), z.string().default('')]);
