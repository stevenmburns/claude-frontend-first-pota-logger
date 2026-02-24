import { useState, useEffect, useCallback } from 'react'
import { getDb } from '../db/db.client'
import type { Qso } from '../db/types'

export function useQsos(sessionId: string | null) {
  const [qsos, setQsos] = useState<Qso[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!sessionId) return
    setLoading(true)
    try {
      const db = await getDb()
      const rows = await db.getQsosForSession(sessionId)
      setQsos(rows)
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { qsos, loading, refresh }
}
