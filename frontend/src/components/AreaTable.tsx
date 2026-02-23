import type { TableActions } from "../types/actions"
import type { Area } from "../types/area"
import type { ProcessNode } from "../types/process"

import { areaMatchesSearch, filterProcessTree, normalize } from "../utils/searchTree"

import { PlusIcon, SearchIcon } from "./icons"

import { AreaRow } from "./AreaRow"

import styles from "./AreaTable.module.css"

interface AreaTableProps {
  areas: Area[]
  processTree: ProcessNode[]
  search: string
  actions: TableActions
}

export function AreaTable({ areas, processTree, search, actions }: AreaTableProps) {
  const normalizedSearch = search.toLowerCase().trim()
  const isSearching = normalizedSearch.length > 0

  const processesByArea = (areaId: string): ProcessNode[] => processTree.filter((node) => node.areaId === areaId)

  const visibleAreas = areas.filter((area) => {
    const nodes = processesByArea(area.id)
    return areaMatchesSearch(area, nodes, normalizedSearch)
  })

  if (visibleAreas.length === 0 && isSearching) {
    return (
      <div className={styles.empty}>
        <SearchIcon size={40} />
        <p>
          Nenhum resultado para <strong>"{search}"</strong>
        </p>
      </div>
    )
  }

  if (visibleAreas.length === 0) {
    return (
      <div className={styles.empty}>
        <PlusIcon size={40} />
        <p>Nenhuma área cadastrada. Crie a primeira área para começar.</p>
      </div>
    )
  }

  return (
    <div className={styles.list}>
      {visibleAreas.map((area) => {
        const originalIdx = areas.findIndex((a) => a.id === area.id)
        const nodes = processesByArea(area.id)
        const areaNameMatches = normalize(area.name).includes(normalize(search))
        const filteredNodes = isSearching && !areaNameMatches
          ? filterProcessTree(nodes, search)
          : nodes

        function reorder(fromIdx: number, toIdx: number) {
          const reordered = [...areas]
          const [moved] = reordered.splice(fromIdx, 1)
          reordered.splice(toIdx, 0, moved)
          actions.onReorderArea(reordered.map((a) => a.id))
        }

        return (
          <AreaRow
            key={area.id}
            area={area}
            processes={filteredNodes}
            actions={actions}
            defaultExpanded={isSearching}
            onMoveUp={!isSearching && originalIdx > 0 ? () => reorder(originalIdx, originalIdx - 1) : undefined}
            onMoveDown={!isSearching && originalIdx < areas.length - 1 ? () => reorder(originalIdx, originalIdx + 1) : undefined}
          />
        )
      })}
    </div>
  )
}
