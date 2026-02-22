import type { Area, CreateAreaPayload, UpdateAreaPayload } from "../types/area"
import { api } from "./api"

export const areaService = {
  async getAll(): Promise<Area[]> {
    const { data } = await api.get<Area[]>("/areas")
    return data
  },

  async create(payload: CreateAreaPayload): Promise<Area> {
    const { data } = await api.post<Area>("/areas", payload)
    return data
  },

  async update(id: string, payload: UpdateAreaPayload): Promise<Area> {
    const { data } = await api.patch<Area>(`/areas/${id}`, payload)
    return data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/areas/${id}`)
  },

  async reorder(orderedIds: string[]): Promise<void> {
    await api.patch("/areas/reorder", { orderedIds })
  },
}
