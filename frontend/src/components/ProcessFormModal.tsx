import { useEffect, useState } from "react"
import type { Process, ProcessStatus } from "../types/process"
import { processService } from "../services/process.service"
import { Modal } from "./Modal"
import f from "./FormFields.module.css"

interface ProcessFormModalProps {
  process?: Process
  areaId?: string
  parentId?: string | null
  contextLabel?: string
  onClose: () => void
  onSuccess: () => void
}

const STATUS_OPTIONS: { value: ProcessStatus; label: string; description: string }[] = [
  { value: "MANUAL", label: "Manual", description: "Executado por pessoas, sem automação" },
  { value: "SYSTEMIC", label: "Sistêmico", description: "Executado por sistemas ou ferramentas" },
]

export function ProcessFormModal({
  process,
  areaId,
  parentId,
  contextLabel,
  onClose,
  onSuccess,
}: ProcessFormModalProps) {
  const [name, setName] = useState(() => process?.name ?? "")
  const [tools, setTools] = useState(() => process?.tools ?? "")
  const [responsible, setResponsible] = useState(() => process?.responsible ?? "")
  const [documentation, setDocumentation] = useState(() => process?.documentation ?? "")
  const [status, setStatus] = useState<ProcessStatus | "">(() => process?.status ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [breadcrumb, setBreadcrumb] = useState<Process[]>([])

  useEffect(() => {
    if (!process) return
    processService.getBreadcrumb(process.id)
      .then(setBreadcrumb)
      .catch(() => {})
  }, [process?.id])

  const resolvedAreaId = areaId ?? process?.areaId ?? ""

  const title = process
    ? "Editar processo"
    : parentId
      ? "Novo subprocesso"
      : "Novo processo"

  async function handleSubmit() {
    if (!name.trim()) return

    try {
      setLoading(true)
      setError(null)

      const payload = {
        name: name.trim(),
        tools: tools.trim() || undefined,
        responsible: responsible.trim() || undefined,
        documentation: documentation.trim() || undefined,
        status: (status as ProcessStatus) || undefined,
      }

      if (process) {
        await processService.update(process.id, payload)
      } else {
        await processService.create({
          ...payload,
          areaId: resolvedAreaId,
          parentId: parentId ?? null,
        })
      }

      onSuccess()
      onClose()
    } catch {
      setError("Erro ao salvar. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title={title} onClose={onClose} maxWidth={560}>
      {contextLabel && (
        <p className={f.contextLabel}>
          Em: <strong>{contextLabel}</strong>
        </p>
      )}

      {breadcrumb.length > 0 && (
        <p className={f.breadcrumb}>
          {breadcrumb.map((p, i) => (
            <span key={p.id}>
              {i > 0 && <span className={f.breadcrumbSep}> › </span>}
              {p.name}
            </span>
          ))}
        </p>
      )}

      <form
        className={f.form}
        onSubmit={(e) => { e.preventDefault(); void handleSubmit() }}
      >
        <div className={f.field}>
          <label className={f.label}>
            Nome do processo <span className={f.required}>*</span>
          </label>

          <input
            className={f.input}
            type="text"
            placeholder="ex: Recrutamento e Seleção"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            required
          />
        </div>

        <div className={f.field}>
          <label className={f.label}>Tipo</label>

          <select
            className={f.select}
            value={status}
            onChange={(e) => setStatus(e.target.value as ProcessStatus | "")}
          >
            <option value="">Não definido</option>

            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label} — {opt.description}
              </option>
            ))}
          </select>
        </div>

        <div className={f.field}>
          <label className={f.label}>Sistemas e ferramentas utilizados</label>

          <input
            className={f.input}
            type="text"
            placeholder="ex: Trello, Notion, SAP"
            value={tools}
            onChange={(e) => setTools(e.target.value)}
          />
          <p className={f.hint}>Separe múltiplas ferramentas por vírgula</p>
        </div>

        <div className={f.field}>
          <label className={f.label}>Responsáveis</label>

          <input
            className={f.input}
            type="text"
            placeholder="ex: Equipe de RH, João Silva"
            value={responsible}
            onChange={(e) => setResponsible(e.target.value)}
          />
        </div>

        <div className={f.field}>
          <label className={f.label}>Documentação associada</label>

          <textarea
            className={f.textarea}
            placeholder="Descreva ou cole o link da documentação relevante"
            value={documentation}
            onChange={(e) => setDocumentation(e.target.value)}
          />
        </div>

        {error && <p className={f.error}>{error}</p>}

        <div className={f.actions}>
          <button type="button" className={f.btnCancel} onClick={onClose}>
            Cancelar
          </button>

          <button
            type="submit"
            className={f.btnSubmit}
            disabled={!name.trim() || loading}
          >
            {loading ? "Salvando…" : process ? "Salvar alterações" : "Criar"}
          </button>
        </div>
      </form>
    </Modal>
  )
}