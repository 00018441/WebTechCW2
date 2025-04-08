import { z } from "zod";

export const postsParamsSchema = z.object({
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
    title: z.string().toLowerCase().trim().max(255).optional(),
    description: z.string().toLowerCase().trim().max(255).optional(),
});
