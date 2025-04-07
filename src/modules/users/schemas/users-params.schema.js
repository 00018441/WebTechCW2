import { z } from "zod";

export const usersParamsSchema = z.object({
    page: z
        .string()
        .transform((str) => Number(str))
        .pipe(z.number().int().nonnegative())
        .optional(),
    limit: z
        .string()
        .transform((str) => Number(str))
        .pipe(z.number().int().positive().max(100))
        .optional(),
    username: z.string().toLowerCase().trim().max(255).optional(),
});
