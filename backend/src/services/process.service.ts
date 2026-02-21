import { prisma } from "../lib/prisma.js"

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

  async create(data: any) {
    return prisma.process.create({ data })
  },

  async update(id: string, data: any) {
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

    const map = new Map()
    const roots: any[] = []

    processes.forEach(p => map.set(p.id, { ...p, children: [] }))

    processes.forEach(p => {
      if (p.parentId) {
        map.get(p.parentId)?.children.push(map.get(p.id))
      } else {
        roots.push(map.get(p.id))
      }
    })

    return roots
  },

  async getBreadcrumb(id: string) {
    const breadcrumb = []
    let current = await prisma.process.findUnique({ where: { id } })

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