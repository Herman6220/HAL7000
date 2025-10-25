import * as z from "zod"


export const signUpSchema = z.object({
    name: z
        .string()
        .min(5, "Name must be of at least 5 characters.")
        .max(20, "Name can't be of more than 20 characters."),
    email: z.email(),
    password: z.string(),
})