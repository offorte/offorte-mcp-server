import { z } from 'zod';

export const emptyObject = z.object({});
export const optionalId = z.union([z.number(), z.null()]).optional();
export const stringOrNumber = z.union([z.number(), z.string()]);

// The API uses false for an unset option, for example selectable: false
export const falseOrString = z.union([z.literal(false), z.string()]);
