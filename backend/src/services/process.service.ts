import type { Process } from "@prisma/client"
import { prisma } from "../lib/prisma.js"
import type { CreateProcessInput, UpdateProcessInput } from "../schemas/process.schema.js"

type ProcessNode = Process & { children: ProcessNode[] }

export const processService = {
  async getTree(): Promise<ProcessNode[]> {
    const processes = await prisma.process.findMany({ orderBy: { order: "asc" } })

    const map = new Map<string, ProcessNode>()
    const roots: ProcessNode[] = []

    for (const p of processes) {
      map.set(p.id, { ...p, children: [] })
    }

    for (const p of processes) {
      const node = map.get(p.id)
      if (!node) continue

      if (p.parentId) {
        map.get(p.parentId)?.children.push(node)
      } else {
        roots.push(node)
      }
    }

    return roots
  },

  async create(data: CreateProcessInput) {
    return prisma.process.create({ data })
  },

  async update(id: string, data: UpdateProcessInput) {
    return prisma.process.update({ where: { id }, data })
  },

  async delete(id: string) {
    const descendants = await prisma.$queryRaw<{ id: string }[]>`
      WITH RECURSIVE descendants AS (
        SELECT id FROM "Process" WHERE id = ${id}
        UNION ALL
        SELECT p.id FROM "Process" p
        INNER JOIN descendants d ON p."parentId" = d.id
      )
      SELECT id FROM descendants
    `

    const ids = descendants.map((d) => d.id)

    return prisma.process.deleteMany({
      where: { id: { in: ids } },
    })
  },

  async getBreadcrumb(id: string): Promise<Process[]> {
    return prisma.$queryRaw<Process[]>`
      WITH RECURSIVE breadcrumb AS (
        SELECT * FROM "Process" WHERE id = ${id}
        UNION ALL
        SELECT p.* FROM "Process" p
        INNER JOIN breadcrumb b ON p.id = b."parentId"
      )
      SELECT * FROM breadcrumb ORDER BY level ASC
    `
  },

  async move(id: string, parentId: string | null) {
    return prisma.process.update({ where: { id }, data: { parentId } })
  },
}