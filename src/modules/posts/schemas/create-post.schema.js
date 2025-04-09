import { z } from "zod";

export const createPostSchema = z.object({
    title: z
        .string()
        .min(3, "Post title should be at least 3 characters long")
        .max(50, "Post title cannot be this long"),
    description: z
        .string()
        .min(8, "Post description should be at least 8 characters long")
        .max(2000, "Post description cannot be this long"),
});
