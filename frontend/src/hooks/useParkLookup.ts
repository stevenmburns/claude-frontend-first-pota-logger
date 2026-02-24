import { useState, useEffect } from 'react'
import { lookupPark, type PotaPark } from '../services/potaApi'

export function useParkLookup(ref: string): { park: PotaPark | null; loading: boolean } {
  const [park, setPark] = useState<PotaPark | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const trimmed = ref.trim().toUpperCase()
    if (!trimmed) {
      setPark(null)
      return
    }

    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const result = await lookupPark(trimmed)
        setPark(result)
      } catch {
        setPark(null)
      } finally {
        setLoading(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [ref])

  return { park, loading }
}
