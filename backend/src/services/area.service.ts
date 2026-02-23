import { prisma } from "../lib/prisma.js"
import type { CreateAreaInput, UpdateAreaInput } from "../schemas/area.schema.js"

export const areaService = {
  async getAll() {
    return prisma.area.findMany({ orderBy: { order: "asc" } })
  },

  async create(data: CreateAreaInput) {
    return prisma.area.create({ data })
  },

  async update(id: string, data: UpdateAreaInput) {
    return prisma.area.update({ where: { id }, data })
  },

  async delete(id: string) {
    return prisma.area.delete({ where: { id } })
  },

  async reorder(orderedIds: string[]) {
    return prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.area.update({ where: { id }, data: { order: index } })
      )
    )
  },
}