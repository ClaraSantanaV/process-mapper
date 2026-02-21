import { prisma } from "../lib/prisma.js"

export const areaService = {
  async getAll() {
    return prisma.area.findMany({
      include: { processes: true },
      orderBy: { order: "asc" }
    })
  },

  async create(name: string) {
    return prisma.area.create({
      data: { name }
    })
  },

  async update(id: string, name: string) {
    return prisma.area.update({
      where: { id },
      data: { name }
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