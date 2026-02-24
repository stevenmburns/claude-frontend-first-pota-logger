import { useState, useEffect, useCallback } from 'react'
import { fetchActiveSpots, type PotaSpot } from '../services/potaApi'
import type { Qso } from '../db/types'

export interface AnnotatedSpot extends PotaSpot {
  hunted: boolean
}

function buildHuntedSet(qsos: Qso[]): Set<string> {
  return new Set(qsos.map(q => `${q.callsign}:${q.park_reference}`))
}

export function useSpots(qsos: Qso[]): {
  spots: AnnotatedSpot[]
  loading: boolean
  error: Error | null
  refresh: () => void
} {
  const [spots, setSpots] = useState<AnnotatedSpot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [tick, setTick] = useState(0)

  const refresh = useCallback(() => setTick(t => t + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchActiveSpots()
      .then(raw => {
        if (cancelled) return
        const hunted = buildHuntedSet(qsos)
        setSpots(raw.map(s => ({
          ...s,
          hunted: hunted.has(`${s.activator}:${s.reference}`),
        })))
        setError(null)
      })
      .catch(err => {
        if (!cancelled) setError(err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick])

  // Re-annotate when QSOs change without re-fetching
  useEffect(() => {
    setSpots(prev => {
      const hunted = buildHuntedSet(qsos)
      return prev.map(s => ({
        ...s,
        hunted: hunted.has(`${s.activator}:${s.reference}`),
      }))
    })
  }, [qsos])

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  return { spots, loading, error, refresh }
}
