import { useEffect, useState } from "react"

import { ArrowDownIcon, ArrowUpIcon, ChevronIcon, EditIcon, PlusIcon, TrashIcon } from "./icons"

import type { TableActions } from "../types/actions"
import type { Area } from "../types/area"
import type { ProcessNode } from "../types/process"

import { ProcessRow } from "./ProcessRow"

import styles from "./AreaRow.module.css"

interface AreaRowProps {
  area: Area
  processes: ProcessNode[]
  actions: TableActions
  defaultExpanded?: boolean
  onMoveUp?: () => void
  onMoveDown?: () => void
}

export function AreaRow({ area, processes, actions, defaultExpanded = false, onMoveUp, onMoveDown }: AreaRowProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  useEffect(() => {
    setIsExpanded(defaultExpanded)
  }, [defaultExpanded])

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setIsExpanded((v) => !v)}
          aria-expanded={isExpanded}
        >
          <ChevronIcon size={13} className={isExpanded ? styles.chevronOpen : ""} />
        </button>

        <span className={styles.areaName}>{area.name}</span>

        <span className={styles.count}>
          {processes.length}{" "}
          {processes.length === 1 ? "processo" : "processos"}
        </span>

        <div className={styles.actions}>
          {onMoveUp && (
            <button
              type="button"
              className={styles.actionBtn}
              title="Mover acima"
              onClick={onMoveUp}
            >
              <ArrowUpIcon />
            </button>
          )}

          {onMoveDown && (
            <button
              type="button"
              className={styles.actionBtn}
              title="Mover abaixo"
              onClick={onMoveDown}
            >
              <ArrowDownIcon />
            </button>
          )}
          
          <button
            type="button"
            className={styles.actionBtn}
            title="Adicionar processo"
            onClick={() => actions.onCreateProcess(area.id, null, area.name)}
          >
            <PlusIcon />
          </button>

          <button
            type="button"
            className={styles.actionBtn}
            title="Editar área"
            onClick={() => actions.onEditArea(area)}
          >
            <EditIcon />
          </button>

          <button
            type="button"
            className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
            title="Excluir área"
            onClick={() => actions.onDeleteArea(area)}
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className={styles.body}>
          {processes.length === 0 ? (
            <div className={styles.empty}>
              <p>Nenhum processo cadastrado.</p>

              <button
                type="button"
                className={styles.addFirstBtn}
                onClick={() => actions.onCreateProcess(area.id, null, area.name)}
              >
                <PlusIcon size={13} />
                Adicionar primeiro processo
              </button>
            </div>
          ) : (
            processes.map((node) => (
              <ProcessRow
                key={node.id}
                node={node}
                actions={actions}
                depth={0}
                defaultExpanded={defaultExpanded}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}
