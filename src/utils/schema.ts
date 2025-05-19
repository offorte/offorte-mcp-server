import { z } from 'zod';

export const optionalId = z.union([z.number(), z.literal(false), z.null()]).optional();
export const emptyObject = z.object({});
