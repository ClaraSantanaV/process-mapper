import { z } from "zod"

export const createProcessSchema = z.object({
  name: z.string().min(1),
  areaId: z.string().uuid(),
  parentId: z.string().uuid().nullable().optional(),
  tools: z.string().optional(),
  responsible: z.string().optional(),
  documentation: z.string().url().optional(),
  status: z.enum(["MANUAL", "SYSTEMIC"]).optional(),
  order: z.number().int().min(0).optional()
})

export const updateProcessSchema = createProcessSchema.partial()

export const moveProcessSchema = z.object({
  parentId: z.string().uuid().nullable(),
  order: z.number().int().min(0).optional()
})