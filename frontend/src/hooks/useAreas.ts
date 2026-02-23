import { useEffect, useState } from "react"

import { areaService } from "../services/area.service"

import type { Area } from "../types/area"

export function useAreas() {
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchAreas() {
    try {
      setLoading(true)
      setError(null)

      const data = await areaService.getAll()
      setAreas(data)
    } catch {
      setError("Falha ao carregar áreas.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchAreas()
  }, [])

  return { areas, loading, error, refetch: fetchAreas }
}
