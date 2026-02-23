import { Router } from "express"
import { asyncHandler } from "../middlewares/async.middleware.js"
import { areaService } from "../services/area.service.js"
import { createAreaSchema, reorderAreaSchema, updateAreaSchema } from "../schemas/area.schema.js"

const router = Router()

router.get("/", asyncHandler(async (_req, res) => {
  const areas = await areaService.getAll()
  res.json(areas)
}))

router.post("/", asyncHandler(async (req, res) => {
  const parsed = createAreaSchema.parse(req.body)
  const area = await areaService.create(parsed)
  res.status(201).json(area)
}))

router.patch("/reorder", asyncHandler(async (req, res) => {
  const { orderedIds } = reorderAreaSchema.parse(req.body)
  await areaService.reorder(orderedIds)
  res.json({ message: "Areas reordered" })
}))

router.patch("/:id", asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string }
  const parsed = updateAreaSchema.parse(req.body)
  const area = await areaService.update(id, parsed)
  res.json(area)
}))

router.delete("/:id", asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string }
  await areaService.delete(id)
  res.json({ message: "Area deleted" })
}))

export default router