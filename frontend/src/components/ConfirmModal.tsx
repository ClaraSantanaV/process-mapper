import { useState } from "react"
import { Modal } from "./Modal"
import f from "./FormFields.module.css"
import styles from "./ConfirmModal.module.css"

interface ConfirmModalProps {
  title: string
  description: string
  confirmLabel?: string
  onClose: () => void
  onConfirm: () => Promise<void>
}

export function ConfirmModal({
  title,
  description,
  confirmLabel = "Excluir",
  onClose,
  onConfirm,
}: ConfirmModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    try {
      setLoading(true)
      setError(null)
      
      await onConfirm()
      onClose()
    } catch {
      setError("Erro ao executar a ação. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title={title} onClose={onClose} maxWidth={420}>
      <p className={styles.description}>{description}</p>

      {error && <p className={f.error} style={{ marginTop: 8 }}>{error}</p>}

      <div className={f.actions}>
        <button type="button" className={f.btnCancel} onClick={onClose}>
          Cancelar
        </button>

        <button
          type="button"
          className={styles.btnDanger}
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? "Excluindo…" : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
