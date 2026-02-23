import { useState } from "react"
import { processService } from "../services/process.service"
import type { Process, ProcessNode } from "../types/process"
import f from "./FormFields.module.css"
import { Modal } from "./Modal"

interface MoveProcessModalProps {
  process: Process
  processTree: ProcessNode[]
  onClose: () => void
  onSuccess: () => void
}

interface FlatOption {
  id: string
  name: string
  depth: number
}

/** Collects all ids of a node and its descendants (used to exclude from move targets). */
function getDescendantIds(nodes: ProcessNode[], targetId: string): Set<string> {
  const ids = new Set<string>()

  function walk(node: ProcessNode) {
    ids.add(node.id)
    node.children.forEach(walk)
  }

  function find(nodes: ProcessNode[]) {
    for (const node of nodes) {
      if (node.id === targetId) {
        walk(node)
        return
      }
      find(node.children)
    }
  }

  find(nodes)
  return ids
}

/** Flattens a process tree into a list of options, skipping excluded ids. */
function flattenTree(nodes: ProcessNode[], excludeIds: Set<string>): FlatOption[] {
  const result: FlatOption[] = []

  function walk(node: ProcessNode, depth: number) {
    if (excludeIds.has(node.id)) return
    result.push({ id: node.id, name: node.name, depth })
    node.children.forEach((child) => walk(child, depth + 1))
  }

  nodes.forEach((node) => walk(node, 0))
  return result
}

export function MoveProcessModal({ process, processTree, onClose, onSuccess }: MoveProcessModalProps) {
  const [parentId, setParentId] = useState<string>(() => process.parentId ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const excludeIds = getDescendantIds(processTree, process.id)
  const areaNodes = processTree.filter((n) => n.areaId === process.areaId)
  const options = flattenTree(areaNodes, excludeIds)

  async function handleSubmit() {
    try {
      setLoading(true)
      setError(null)
      await processService.move(process.id, parentId === "" ? null : parentId)
      onSuccess()
      onClose()
    } catch {
      setError("Erro ao mover processo. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Mover processo" onClose={onClose} maxWidth={480}>
      <p className={f.contextLabel}>
        Movendo: <strong>{process.name}</strong>
      </p>

      <form
        className={f.form}
        onSubmit={(e) => { e.preventDefault(); void handleSubmit() }}
      >
        <div className={f.field}>
          <label className={f.label}>Novo local</label>

          <select
            className={f.select}
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
          >
            <option value="">— Raiz da área (sem processo pai)</option>
            {options.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {"\u00a0\u00a0".repeat(opt.depth)}{opt.depth > 0 ? "↳ " : ""}{opt.name}
              </option>
            ))}
          </select>

          <p className={f.hint}>Selecione o processo pai ou "Raiz" para mover para o nível principal da área.</p>
        </div>

        {error && <p className={f.error}>{error}</p>}

        <div className={f.actions}>
          <button type="button" className={f.btnCancel} onClick={onClose}>
            Cancelar
          </button>

          <button type="submit" className={f.btnSubmit} disabled={loading}>
            {loading ? "Movendo…" : "Confirmar"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
