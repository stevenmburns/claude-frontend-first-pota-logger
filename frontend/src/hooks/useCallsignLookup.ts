import { useState, useEffect } from 'react'
import { lookupUser, type PotaUser } from '../services/potaApi'

export function useCallsignLookup(callsign: string): { user: PotaUser | null; loading: boolean } {
  const [user, setUser] = useState<PotaUser | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const trimmed = callsign.trim().toUpperCase()
    if (!trimmed) {
      setUser(null)
      return
    }

    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const result = await lookupUser(trimmed)
        setUser(result)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [callsign])

  return { user, loading }
}
