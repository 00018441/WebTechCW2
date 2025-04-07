import { z } from "zod";

export const registerSchema = z.object({
    username: z.string().min(2, "Username should be at least 1 character long").max(255),
    email: z.string().email(),
    password: z.string().min(8, "Password should contain at least 8 characters").max(255),
});
