import { z } from "zod"

const areaBase = z.object({
  name: z.string().min(1, "Name is required"),
  order: z.number().int().min(0).default(0),
})

export const createAreaSchema = areaBase

export const updateAreaSchema = areaBase.extend({
  name: areaBase.shape.name.optional(),
})

export const reorderAreaSchema = z.object({
  orderedIds: z.array(z.string().uuid()).min(1),
})

export type CreateAreaInput = z.infer<typeof createAreaSchema>
export type UpdateAreaInput = z.infer<typeof updateAreaSchema>