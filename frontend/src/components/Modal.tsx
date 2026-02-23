import type { ReactNode } from "react"
import { useEffect } from "react"

import styles from "./Modal.module.css"

import { XIcon } from "./icons"

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
  maxWidth?: number
}

export function Modal({ title, onClose, children, maxWidth = 480 }: ModalProps) {
   useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }

    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={styles.panel}
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>

          <button type="button" className={styles.close} onClick={onClose} aria-label="Fechar">
            <XIcon size={18} />
          </button>
        </div>

        <div className={styles.body}>{children}</div>
      </div>
    </div>
  )
}
