import type { Area } from "../types/area"
import type { Process } from "../types/process"

export interface TableActions {
  onEditArea: (area: Area) => void
  onDeleteArea: (area: Area) => void
  onReorderArea: (orderedIds: string[]) => void
  onCreateProcess: (areaId: string, parentId: string | null, contextLabel: string) => void
  onEditProcess: (process: Process) => void
  onDeleteProcess: (process: Process) => void
  onMoveProcess: (process: Process) => void
}
