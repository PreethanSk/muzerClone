import {z} from "zod";

export const CreateStreamSchema = z.object({
    url: z.string().url().refine((val) => val.includes("spotify") || val.includes("youtube") || val.includes("youtu.be")),
    active: z.boolean()
})

export const UpvoteSchema = z.object({
    streamId: z.string()
})

export const UserSchema = z.object({
    username: z.string(),
    password: z.string(),
    name: z.string(),
    email: z.string().email()
})

export const SigninSchema = z.object({
    username: z.string(),
    password: z.string()
})