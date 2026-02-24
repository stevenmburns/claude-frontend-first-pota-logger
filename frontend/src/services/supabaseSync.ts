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
