import { Prisma, Process } from "@prisma/client"
import { prisma } from "../lib/prisma.js"

type ProcessNode = Process & { children: ProcessNode[] }

export const processService = {
  async getAll(parentId?: string) {
    return prisma.process.findMany({
      where: { parentId: parentId ?? null },
      orderBy: { order: "asc" }
    })
  },

  async getById(id: string) {
    return prisma.process.findUnique({ where: { id } })
  },

  async create(data: Prisma.ProcessUncheckedCreateInput) {
    return prisma.process.create({ data })
  },

  async update(id: string, data: Prisma.ProcessUncheckedUpdateInput) {
    return prisma.process.update({
      where: { id },
      data
    })
  },

  async delete(id: string) {
    return prisma.process.delete({ where: { id } })
  },

  async move(id: string, parentId: string | null) {
    return prisma.process.update({
      where: { id },
      data: { parentId }
    })
  },

  async getTree() {
    const processes = await prisma.process.findMany({
      orderBy: { order: "asc" }
    })

    const map = new Map<string, ProcessNode>()
    const roots: ProcessNode[] = []

    processes.forEach(process =>
      map.set(process.id, { ...process, children: [] })
    )

    processes.forEach(process => {
      const node = map.get(process.id)
      if (!node) return

      if (process.parentId) {
        map.get(process.parentId)?.children.push(node)
      } else {
        roots.push(node)
      }
    })

    return roots
  },

  async getBreadcrumb(id: string) {
    const breadcrumb: Process[] = []
    let current: Process | null = await prisma.process.findUnique({
      where: { id }
    })

    while (current) {
      breadcrumb.unshift(current)
      if (!current.parentId) break
      current = await prisma.process.findUnique({
        where: { id: current.parentId }
      })
    }

    return breadcrumb
  }
}