import { z } from "zod"

const processBase = z.object({
  name: z.string().min(1),
  areaId: z.string().uuid(),
  parentId: z.string().uuid().nullable().default(null),
  tools: z.string().optional(),
  responsible: z.string().optional(),
  documentation: z.string().url().optional(),
  status: z.enum(["MANUAL", "SYSTEMIC"]).optional(),
  order: z.number().int().min(0).default(0),
})

export const createProcessSchema = processBase

export const updateProcessSchema = processBase
  .omit({ areaId: true, parentId: true })
  .partial()
  .extend({ order: processBase.shape.order })

export const moveProcessSchema = z.object({
  parentId: z.string().uuid().nullable(),
})

export type CreateProcessInput = z.infer<typeof createProcessSchema>
export type UpdateProcessInput = z.infer<typeof updateProcessSchema>