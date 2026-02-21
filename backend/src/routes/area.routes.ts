import { Router } from "express"
import { areaService } from "../services/area.service.js"

const router = Router()

// GET /areas
router.get("/", async (req, res) => {
  const areas = await areaService.getAll()
  res.json(areas)
})

// POST /areas
router.post("/", async (req, res) => {
  const { name } = req.body
  const area = await areaService.create(name)
  res.json(area)
})

// PATCH /areas/:id
router.patch("/:id", async (req, res) => {
  const { id } = req.params
  const { name } = req.body

  const area = await areaService.update(id, name)
  res.json(area)
})

// DELETE /areas/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params
  await areaService.delete(id)

  res.json({ message: "Area deleted" })
})

// PATCH /areas/reorder
router.patch("/reorder", async (req, res) => {
  const { orderedIds } = req.body
  await areaService.reorder(orderedIds)

  res.json({ message: "Areas reordered" })
})

export default router