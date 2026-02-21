import { z } from "zod"

export const createAreaSchema = z.object({
  name: z.string().min(1, "Name is required"),
  order: z.number().int().min(0).optional()
})

export const updateAreaSchema = createAreaSchema.partial()