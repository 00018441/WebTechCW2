import { z } from "zod";

export const loginDtoSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, "Password should contain at least 8 characters").max(255),
});
