import * as z from "zod"

export const userModel = z.object({
  id: z.number().int(),
  name: z.string(),
  username: z.string(),
  password: z.string(),
  email: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
