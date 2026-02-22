export type ProcessStatus = "MANUAL" | "SYSTEMIC"

export interface Process {
  id: string
  name: string
  areaId: string
  parentId: string | null
  level: number
  order: number
  tools: string | null
  responsible: string | null
  documentation: string | null
  status: ProcessStatus | null
  createdAt: string
  updatedAt: string
}

export interface ProcessNode extends Process {
  children: ProcessNode[]
}

export interface CreateProcessPayload {
  name: string
  areaId: string
  parentId?: string | null
  tools?: string
  responsible?: string
  documentation?: string
  status?: ProcessStatus
  order?: number
}

export type UpdateProcessPayload = Partial<CreateProcessPayload>
