import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getDb } from '../db/db.client'
import type { HuntSession, Qso } from '../db/types'

let supabase: SupabaseClient | null = null

export function initSupabase(url: string, key: string): void {
  if (!url || !key) {
    supabase = null
    return
  }
  supabase = createClient(url, key)
}

async function syncSession(session: HuntSession): Promise<void> {
  if (!supabase) return
  await supabase
    .from('hunt_sessions')
    .upsert({ id: session.id, session_date: session.session_date, created_at: session.created_at }, { onConflict: 'id' })
}

async function syncQso(qso: Qso): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase
    .from('qsos')
    .upsert({
      id: qso.id,
      hunt_session_id: qso.hunt_session_id,
      park_reference: qso.park_reference,
      callsign: qso.callsign,
      frequency: qso.frequency,
      band: qso.band,
      mode: qso.mode,
      rst_sent: qso.rst_sent,
      rst_received: qso.rst_received,
      timestamp: qso.timestamp,
      created_at: qso.created_at,
    }, { onConflict: 'id' })
  return !error
}

export async function pushUnsyncedQsos(): Promise<void> {
  if (!supabase) return
  try {
    const db = await getDb()
    const unsyncedQsos = await db.getUnsyncedQsos()
    // Group by session so we upsert each session once before its QSOs
    const sessionIds = [...new Set(unsyncedQsos.map(q => q.hunt_session_id))]
    for (const sessionId of sessionIds) {
      try {
        const session = await db.getSessionById(sessionId)
        if (session) await syncSession(session)
      } catch {
        // skip
      }
    }
    for (const qso of unsyncedQsos) {
      try {
        const ok = await syncQso(qso)
        if (ok) await db.markQsoSynced(qso.id)
      } catch {
        // fire-and-forget: silently skip failed rows
      }
    }
  } catch {
    // silently ignore
  }
}

export async function fetchWorkedParks(url: string, key: string): Promise<Set<string>> {
  if (!url || !key) return new Set()
  try {
    const resp = await fetch(`${url}/rest/v1/rpc/get_worked_parks`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: '{}',
    })
    if (!resp.ok) return new Set()
    const parks: string[] | null = await resp.json()
    return new Set((parks ?? []).filter(Boolean))
  } catch {
    return new Set()
  }
}

export async function pullAllFromSupabase(): Promise<void> {
  if (!supabase) return
  try {
    const { data: sessions, error: sErr } = await supabase
      .from('hunt_sessions')
      .select('*')
    if (sErr || !sessions) return

    const allQsos: Omit<Qso, 'synced'>[] = []
    const PAGE = 1000
    let from = 0
    while (true) {
      const { data, error } = await supabase
        .from('qsos')
        .select('*')
        .range(from, from + PAGE - 1)
      if (error || !data || data.length === 0) break
      allQsos.push(...data)
      if (data.length < PAGE) break
      from += PAGE
    }

    const db = await getDb()
    await db.upsertQsosFromRemote(sessions, allQsos)
  } catch {
    // silently ignore
  }
}

export async function syncNewQso(qso: Qso, session: HuntSession): Promise<void> {
  if (!supabase) return
  try {
    await syncSession(session)
    const ok = await syncQso(qso)
    if (ok) {
      const db = await getDb()
      await db.markQsoSynced(qso.id)
    }
  } catch {
    // fire-and-forget
  }
}
