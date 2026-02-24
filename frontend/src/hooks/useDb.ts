import { useState, useEffect } from 'react'
import { getDb, type DbClient } from '../db/db.client'

interface UseDbState {
  db: DbClient | null
  loading: boolean
  error: Error | null
}

export function useDb(): UseDbState {
  const [state, setState] = useState<UseDbState>({ db: null, loading: true, error: null })

  useEffect(() => {
    let cancelled = false
    getDb()
      .then(db => {
        if (!cancelled) setState({ db, loading: false, error: null })
      })
      .catch(err => {
        if (!cancelled) setState({ db: null, loading: false, error: err })
      })
    return () => { cancelled = true }
  }, [])

  return state
}
