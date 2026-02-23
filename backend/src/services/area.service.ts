import { Prisma } from "@prisma/client"
import { prisma } from "../lib/prisma.js"

export const areaService = {
  async getAll() {
    return prisma.area.findMany({
      include: { processes: true },
      orderBy: { order: "asc" }
    })
  },

  async create(data: Prisma.AreaCreateInput) {
    return prisma.area.create({
      data
    })
  },

  async update(id: string, data: Prisma.AreaUpdateInput) {
    return prisma.area.update({
      where: { id },
      data
    })
  },

  async delete(id: string) {
    return prisma.area.delete({
      where: { id }
    })
  },

  async reorder(orderedIds: string[]) {
    const updates = orderedIds.map((id, index) =>
      prisma.area.update({
        where: { id },
        data: { order: index }
      })
    )

    return Promise.all(updates)
  }
}