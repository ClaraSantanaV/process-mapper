import type {
  CreateProcessPayload,
  Process,
  ProcessNode,
  UpdateProcessPayload,
} from "../types/process"
import { api } from "./api"

export const processService = {
  async getTree(): Promise<ProcessNode[]> {
    const { data } = await api.get<ProcessNode[]>("/processes/tree")
    return data
  },
  
  async create(payload: CreateProcessPayload): Promise<Process> {
    const { data } = await api.post<Process>("/processes", payload)
    return data
  },

  async update(id: string, payload: UpdateProcessPayload): Promise<Process> {
    const { data } = await api.patch<Process>(`/processes/${id}`, payload)
    return data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/processes/${id}`)
  },

  async getBreadcrumb(id: string): Promise<Process[]> {
    const { data } = await api.get<Process[]>(`/processes/${id}/breadcrumb`)
    return data
  },

  async move(id: string, parentId: string | null): Promise<Process> {
    const { data } = await api.patch<Process>(`/processes/${id}/move`, { parentId })
    return data
  },
}
