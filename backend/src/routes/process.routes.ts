import { Router } from "express"
import { processService } from "../services/process.service.js"
import { createProcessSchema, updateProcessSchema } from "../schemas/process.schema.js"

const router = Router()

router.get("/", async (req, res) => {
  const { parentId } = req.query
  const data = await processService.getAll(parentId as string)
  res.json(data)
})

router.get("/tree", async (_, res) => {
  const tree = await processService.getTree()
  res.json(tree)
})

router.get("/:id", async (req, res) => {
  const data = await processService.getById(req.params.id)
  res.json(data)
})

router.get("/:id/breadcrumb", async (req, res) => {
  const data = await processService.getBreadcrumb(req.params.id)
  res.json(data)
})

router.post("/", async (req, res) => {
  const parsed = createProcessSchema.parse(req.body)
  const data = await processService.create(parsed)
  res.json(data)
})

router.patch("/:id", async (req, res) => {
  const parsed = updateProcessSchema.parse(req.body)
  const data = await processService.update(req.params.id, parsed)
  res.json(data)
})

router.patch("/:id/move", async (req, res) => {
  const { parentId } = req.body
  const data = await processService.move(req.params.id, parentId)
  res.json(data)
})

router.delete("/:id", async (req, res) => {
  await processService.delete(req.params.id)
  res.json({ message: "Deleted" })
})

export default router