import { useState, useEffect } from 'react'
import { getDb } from '../db/db.client'
import { generateUuid } from '../utils/uuid'
import type { HuntSession } from '../db/types'

interface UseTodaySessionState {
  session: HuntSession | null
  loading: boolean
  error: Error | null
}

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10)
}

export function useTodaySession(): UseTodaySessionState {
  const [state, setState] = useState<UseTodaySessionState>({
    session: null, loading: true, error: null,
  })

  useEffect(() => {
    let cancelled = false
    const sessionDate = todayDateString()

    getDb()
      .then(async db => {
        let session = await db.getTodaySession(sessionDate)
        if (!session) {
          session = await db.createSession(generateUuid(), sessionDate, new Date().toISOString())
        }
        if (!cancelled) setState({ session, loading: false, error: null })
      })
      .catch(err => {
        if (!cancelled) setState({ session: null, loading: false, error: err })
      })

    return () => { cancelled = true }
  }, [])

  return state
}
