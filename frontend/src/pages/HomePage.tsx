import { useState } from "react"

import { AreaFormModal } from "../components/AreaFormModal"
import { AreaTable } from "../components/AreaTable"
import { ConfirmModal } from "../components/ConfirmModal"
import { MoveProcessModal } from "../components/MoveProcessModal"
import { ProcessFormModal } from "../components/ProcessFormModal"
import { GridIcon, PlusIcon } from "../components/icons"
import { SearchBar } from "../components/SearchBar"

import { useAreas } from "../hooks/useAreas"
import { useProcessTree } from "../hooks/useProcessTree"

import { areaService } from "../services/area.service"
import { processService } from "../services/process.service"

import type { TableActions } from "../types/actions"
import type { Area } from "../types/area"
import type { Process } from "../types/process"

import styles from "./HomePage.module.css"

type ModalState =
  | { type: "none" }
  | { type: "createArea" }
  | { type: "editArea"; area: Area }
  | { type: "deleteArea"; area: Area }
  | { type: "createProcess"; areaId: string; parentId: string | null; contextLabel: string }
  | { type: "editProcess"; process: Process }
  | { type: "deleteProcess"; process: Process }
  | { type: "moveProcess"; process: Process }

export function HomePage() {
  const [search, setSearch] = useState("")
  const [modal, setModal] = useState<ModalState>({ type: "none" })

  const { areas, loading: areasLoading, error: areasError, refetch: refetchAreas } = useAreas()
  const { tree, loading: treeLoading, error: treeError, refetch: refetchTree } = useProcessTree()

  const isLoading = areasLoading || treeLoading
  const error = areasError ?? treeError

  function refetchAll() {
    void refetchAreas()
    void refetchTree()
  }

  const closeModal = () => setModal({ type: "none" })

  const actions: TableActions = {
    onEditArea: (area) => setModal({ type: "editArea", area }),
    onDeleteArea: (area) => setModal({ type: "deleteArea", area }),
    onReorderArea: async (orderedIds) => {
      await areaService.reorder(orderedIds)
      void refetchAreas()
    },
    onCreateProcess: (areaId, parentId, contextLabel) =>
      setModal({ type: "createProcess", areaId, parentId, contextLabel }),
    onEditProcess: (process) => setModal({ type: "editProcess", process }),
    onDeleteProcess: (process) => setModal({ type: "deleteProcess", process }),
    onMoveProcess: (process) => setModal({ type: "moveProcess", process }),
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <GridIcon className={styles.brandIcon} />
            <div>
              <h1 className={styles.title}>Process Mapper</h1>
              <p className={styles.subtitle}>Mapeamento de processos e subprocessos por área</p>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.toolbar}>
          <SearchBar value={search} onChange={setSearch} />

          <div className={styles.toolbarRight}>
            {!isLoading && !error && (
              <span className={styles.summary}>
                {areas.length} {areas.length === 1 ? "área" : "áreas"}
              </span>
            )}

            <button
              type="button"
              className={styles.btnPrimary}
              onClick={() => setModal({ type: "createArea" })}
            >
              <PlusIcon />
              Nova área
            </button>
          </div>
        </div>


        {isLoading && (
          <div className={styles.state}>
            <span className={styles.spinner} />
            <p>Carregando dados…</p>
          </div>
        )}

        {!isLoading && error && (
          <div className={`${styles.state} ${styles.stateError}`}>
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && (
          <AreaTable
            areas={areas}
            processTree={tree}
            search={search}
            actions={actions}
          />
        )}
      </main>

      {modal.type === "createArea" && (
        <AreaFormModal onClose={closeModal} onSuccess={refetchAll} />
      )}

      {modal.type === "editArea" && (
        <AreaFormModal area={modal.area} onClose={closeModal} onSuccess={refetchAll} />
      )}

      {modal.type === "deleteArea" && (
        <ConfirmModal
          title="Excluir área"
          description={`Tem certeza que deseja excluir a área "${modal.area.name}"? Todos os processos vinculados serão removidos.`}
          confirmLabel="Excluir área"
          onClose={closeModal}
          onConfirm={async () => {
            await areaService.delete(modal.area.id)
            refetchAll()
          }}
        />
      )}

      {modal.type === "createProcess" && (
        <ProcessFormModal
          areaId={modal.areaId}
          parentId={modal.parentId}
          contextLabel={modal.contextLabel}
          onClose={closeModal}
          onSuccess={refetchTree}
        />
      )}

      {modal.type === "editProcess" && (
        <ProcessFormModal
          process={modal.process}
          onClose={closeModal}
          onSuccess={refetchTree}
        />
      )}

      {modal.type === "deleteProcess" && (
        <ConfirmModal
          title="Excluir processo"
          description={`Tem certeza que deseja excluir "${modal.process.name}"? Todos os subprocessos vinculados serão removidos.`}
          confirmLabel="Excluir processo"
          onClose={closeModal}
          onConfirm={async () => {
            await processService.delete(modal.process.id)
            refetchTree()
          }}
        />
      )}

      {modal.type === "moveProcess" && (
        <MoveProcessModal
          process={modal.process}
          processTree={tree}
          onClose={closeModal}
          onSuccess={refetchTree}
        />
      )}
    </div>
  )
}
