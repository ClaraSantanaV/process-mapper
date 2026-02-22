import type { Process } from "./process"

export interface Area {
  id: string
  name: string
  order: number
  processes?: Process[]
}

export interface CreateAreaPayload {
  name: string
  order?: number
}

export interface UpdateAreaPayload {
  name?: string
  order?: number
}
