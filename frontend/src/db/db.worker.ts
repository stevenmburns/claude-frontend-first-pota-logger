import * as Comlink from 'comlink'
import sqlite3InitModule from '@sqlite.org/sqlite-wasm'
import { SCHEMA_SQL } from './schema.sql'
import type { HuntSession, Qso, InsertQsoResult } from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any = null

export class DbWorker {
  async init(): Promise<void> {
    if (db) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sqlite3: any = await sqlite3InitModule({ print: console.log, printErr: console.error })
    if (!sqlite3.installOpfsSAHPoolVfs) {
      throw new Error('opfs-sahpool VFS not available in this context')
    }
    const poolUtil = await sqlite3.installOpfsSAHPoolVfs({})
    db = new poolUtil.OpfsSAHPoolDb('/pota.sqlite3')
    db.exec(SCHEMA_SQL)
  }

  async getTodaySession(sessionDate: string): Promise<HuntSession | null> {
    const rows = db.selectObjects(
      'SELECT * FROM hunt_sessions WHERE session_date = ?',
      [sessionDate]
    ) as HuntSession[]
    return rows[0] ?? null
  }

  async getSessionById(id: string): Promise<HuntSession | null> {
    const rows = db.selectObjects(
      'SELECT * FROM hunt_sessions WHERE id = ?',
      [id]
    ) as HuntSession[]
    return rows[0] ?? null
  }

  async createSession(id: string, sessionDate: string, createdAt: string): Promise<HuntSession> {
    db.exec(
      'INSERT OR IGNORE INTO hunt_sessions (id, session_date, created_at) VALUES (?, ?, ?)',
      { bind: [id, sessionDate, createdAt] }
    )
    const rows = db.selectObjects(
      'SELECT * FROM hunt_sessions WHERE session_date = ?',
      [sessionDate]
    ) as HuntSession[]
    return rows[0]
  }

  async insertQso(qso: Omit<Qso, 'synced'>): Promise<InsertQsoResult> {
    try {
      db.exec(
        `INSERT INTO qsos
          (id, hunt_session_id, park_reference, callsign, frequency, band, mode,
           rst_sent, rst_received, timestamp, created_at, synced)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        {
          bind: [
            qso.id, qso.hunt_session_id, qso.park_reference, qso.callsign,
            qso.frequency, qso.band, qso.mode, qso.rst_sent, qso.rst_received,
            qso.timestamp, qso.created_at,
          ],
        }
      )
      return { success: true, id: qso.id }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      if (msg.includes('UNIQUE constraint failed')) {
        return { success: false, duplicate: true }
      }
      throw e
    }
  }

  async deleteQso(id: string): Promise<void> {
    db.exec('DELETE FROM qsos WHERE id = ?', { bind: [id] })
  }

  async getQsosForSession(sessionId: string): Promise<Qso[]> {
    return db.selectObjects(
      'SELECT * FROM qsos WHERE hunt_session_id = ? ORDER BY timestamp DESC',
      [sessionId]
    ) as Qso[]
  }

  async getUnsyncedQsos(): Promise<Qso[]> {
    return db.selectObjects(
      'SELECT * FROM qsos WHERE synced = 0 ORDER BY created_at',
      []
    ) as Qso[]
  }

  async markQsoSynced(id: string): Promise<void> {
    db.exec('UPDATE qsos SET synced = 1 WHERE id = ?', { bind: [id] })
  }
}

Comlink.expose(new DbWorker())
