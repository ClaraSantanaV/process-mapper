import { Router } from "express"
import { asyncHandler } from "../middlewares/async.middleware.js"
import { processService } from "../services/process.service.js"
import { createProcessSchema, moveProcessSchema, updateProcessSchema } from "../schemas/process.schema.js"

const router = Router()

router.get("/tree", asyncHandler(async (_req, res) => {
  const tree = await processService.getTree()
  res.json(tree)
}))

router.get("/:id/breadcrumb", asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string }
  const data = await processService.getBreadcrumb(id)
  res.json(data)
}))

router.post("/", asyncHandler(async (req, res) => {
  const parsed = createProcessSchema.parse(req.body)
  const data = await processService.create(parsed)
  res.status(201).json(data)
}))

router.patch("/:id/move", asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string }
  const { parentId } = moveProcessSchema.parse(req.body)
  const data = await processService.move(id, parentId)
  res.json(data)
}))

router.patch("/:id", asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string }
  const parsed = updateProcessSchema.parse(req.body)
  const data = await processService.update(id, parsed)
  res.json(data)
}))

router.delete("/:id", asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string }
  await processService.delete(id)
  res.json({ message: "Process deleted" })
}))

export default router