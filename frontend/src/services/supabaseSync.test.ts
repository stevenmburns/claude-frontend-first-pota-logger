import { describe, it, expect, vi } from 'vitest'
import { fetchWorkedParks } from './supabaseSync'

vi.mock('../db/db.client', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getDb: vi.fn().mockResolvedValue({
    getWorkedParks: vi.fn().mockResolvedValue(['K-0001', 'K-0002']),
  } as any),
}))

describe('fetchWorkedParks', () => {
  it('includes parks from local SQLite even when Supabase credentials are absent', async () => {
    // Bug: when Supabase credentials are absent, fetchWorkedParks returns an
    // empty Set and never consults local SQLite. After pullAllFromSupabase has
    // synced historical QSOs into the local DB, those parks should still appear
    // in workedParks so the ★ marker is suppressed.
    const result = await fetchWorkedParks('', '')
    expect(result).toEqual(new Set(['K-0001', 'K-0002']))
  })
})
