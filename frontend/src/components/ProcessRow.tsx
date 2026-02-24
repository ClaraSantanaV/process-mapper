import { useEffect, useState } from "react"

import type { ProcessNode, ProcessStatus } from "../types/process"
import type { TableActions } from "../types/actions"

import { ChevronIcon, EditIcon, ManualIcon, MoveIcon, PersonIcon, PlusIcon, SystemIcon, ToolsIcon, TrashIcon } from "./icons"

import styles from "./ProcessRow.module.css"

interface ProcessRowProps {
  node: ProcessNode
  actions: TableActions
  depth?: number
  defaultExpanded?: boolean
}

interface ProcessRowStyle extends React.CSSProperties {
  "--depth": number
}

const STATUS_LABEL: Record<ProcessStatus, string> = {
  MANUAL: "Manual",
  SYSTEMIC: "Sistêmico",
}

export function ProcessRow({ node, actions, depth = 0, defaultExpanded = false }: ProcessRowProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const hasChildren = node.children.length > 0

  useEffect(() => {
    setIsExpanded(defaultExpanded)
  }, [defaultExpanded])

  function toggle() {
    if (hasChildren) setIsExpanded((v) => !v)
  }

  return (
    <div className={styles.wrapper} style={{ "--depth": depth } as ProcessRowStyle}>
     <div className={styles.row}>
        <button
          type="button"
          className={`${styles.toggle} ${hasChildren ? styles.toggleActive : ""}`}
          onClick={toggle}
          tabIndex={hasChildren ? 0 : -1}
          aria-label={isExpanded ? "Colapsar" : "Expandir"}
        >
          {hasChildren ? (
            <ChevronIcon size={11} className={isExpanded ? styles.chevronOpen : ""} />
          ) : (
            <span className={styles.dot} />
          )}
        </button>

        {node.status === "SYSTEMIC" ? (
          <SystemIcon className={`${styles.typeIcon} ${styles.typeIconSystemic}`} />
        ) : node.status === "MANUAL" ? (
          <ManualIcon className={`${styles.typeIcon} ${styles.typeIconManual}`} />
        ) : null}

        <span className={styles.name}>{node.name}</span>

        {(node.status || node.tools || node.responsible) && (
          <div className={styles.meta}>
            {node.status && (
              <span className={`${styles.badge} ${styles[`badge${node.status}`]}`}>
                {STATUS_LABEL[node.status]}
              </span>
            )}
            {node.tools && (
              <span className={styles.pill} title={`Ferramentas: ${node.tools}`}>
                <ToolsIcon />
                {node.tools}
              </span>
            )}
            {node.responsible && (
              <span className={styles.pill} title={`Responsável: ${node.responsible}`}>
                <PersonIcon />
                {node.responsible}
              </span>
            )}
          </div>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.actionBtn}
            title="Adicionar subprocesso"
            onClick={() => actions.onCreateProcess(node.areaId, node.id, node.name)}
          >
            <PlusIcon />
          </button>

          <button
            type="button"
            className={styles.actionBtn}
            title="Mover processo"
            onClick={() => actions.onMoveProcess(node)}
          >
            <MoveIcon />
          </button>

          <button
            type="button"
            className={styles.actionBtn}
            title="Editar processo"
            onClick={() => actions.onEditProcess(node)}
          >
            <EditIcon />
          </button>

          <button
            type="button"
            className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
            title="Excluir processo"
            onClick={() => actions.onDeleteProcess(node)}
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className={styles.children}>
          {node.children.map((child) => (
            <ProcessRow
              key={child.id}
              node={child}
              actions={actions}
              depth={depth + 1}
              defaultExpanded={defaultExpanded}
            />
          ))}
        </div>
      )}
    </div>
  )
}