import { Router } from "express"
import { areaService } from "../services/area.service.js"
import {
  createAreaSchema,
  reorderAreaSchema,
  updateAreaSchema
} from "../schemas/area.schema.js"

const router = Router()

// GET /areas
router.get("/", async (req, res) => {
  const areas = await areaService.getAll()
  res.json(areas)
})

// POST /areas
router.post("/", async (req, res) => {
  const parsed = createAreaSchema.parse(req.body)
  const area = await areaService.create({
    name: parsed.name,
    ...(parsed.order !== undefined && { order: parsed.order })
  })
  res.json(area)
})

// PATCH /areas/reorder
router.patch("/reorder", async (req, res) => {
  const { orderedIds } = reorderAreaSchema.parse(req.body)
  await areaService.reorder(orderedIds)

  res.json({ message: "Areas reordered" })
})

// PATCH /areas/:id
router.patch("/:id", async (req, res) => {
  const { id } = req.params
  const parsed = updateAreaSchema.parse(req.body)
  const area = await areaService.update(id, Object.fromEntries(
    Object.entries(parsed).filter(([, value]) => value !== undefined)
  ))
  res.json(area)
})

// DELETE /areas/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params
  await areaService.delete(id)

  res.json({ message: "Area deleted" })
})


export default router