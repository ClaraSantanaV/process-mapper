import { useEffect, useState } from "react"

import { processService } from "../services/process.service"

import type { ProcessNode } from "../types/process"

export function useProcessTree() {
  const [tree, setTree] = useState<ProcessNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchTree() {
    try {
      setLoading(true)
      setError(null)
      
      const data = await processService.getTree()
      setTree(data)
    } catch {
      setError("Falha ao carregar processos.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchTree()
  }, [])

  return { tree, loading, error, refetch: fetchTree }
}
