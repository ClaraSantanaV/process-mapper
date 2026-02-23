import { useState } from "react"

import type { Area } from "../types/area"

import { areaService } from "../services/area.service"

import { Modal } from "./Modal"

import f from "./FormFields.module.css"

interface AreaFormModalProps {
  area?: Area
  onClose: () => void
  onSuccess: () => void
}

export function AreaFormModal({ area, onClose, onSuccess }: AreaFormModalProps) {
  const [name, setName] = useState(() => area?.name ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!name.trim()) return

    try {
      setLoading(true)
      setError(null)

      if (area) {
        await areaService.update(area.id, { name: name.trim() })
      } else {
        await areaService.create({ name: name.trim() })
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
    <Modal title={area ? "Editar Área" : "Nova Área"} onClose={onClose}>
      <form className={f.form} onSubmit={(e) => { e.preventDefault(); void handleSubmit() }}>
        <div className={f.field}>
          <label className={f.label}>
            Nome da área <span className={f.required}>*</span>
          </label>

          <input
            className={f.input}
            type="text"
            placeholder="ex: Recursos Humanos"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            required
          />

          {error && <p className={f.error}>{error}</p>}
        </div>

        <div className={f.actions}>
          <button type="button" className={f.btnCancel} onClick={onClose}>
            Cancelar
          </button>

          <button
            type="submit"
            className={f.btnSubmit}
            disabled={!name.trim() || loading}
          >
            {loading ? "Salvando…" : area ? "Salvar alterações" : "Criar área"}
          </button>
        </div>
      </form>
    </Modal>
  )
}