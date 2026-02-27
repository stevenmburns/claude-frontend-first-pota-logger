// @vitest-environment node
import Database from 'better-sqlite3'
import { describe, beforeEach, it, expect } from 'vitest'
import { SCHEMA_SQL } from './schema.sql'
import { GET_QSO_COUNTS_BY_DATE_SQL, GET_NEW_PARK_COUNTS_BY_DATE_SQL } from './queries'

let db: Database.Database

function insertSession(id: string, date: string) {
  db.prepare('INSERT INTO hunt_sessions (id, session_date, created_at) VALUES (?, ?, ?)').run(id, date, date + 'T00:00:00Z')
}

function insertQso(id: string, sessionId: string, parkRef: string | null, callsign = 'W1AW') {
  db.prepare(
    `INSERT INTO qsos (id, hunt_session_id, park_reference, callsign, frequency, band, mode, rst_sent, rst_received, timestamp, created_at, synced)
     VALUES (?, ?, ?, ?, 14.225, '20m', 'SSB', '59', '59', ?, ?, 0)`
  ).run(id, sessionId, parkRef, callsign, new Date().toISOString(), new Date().toISOString())
}

beforeEach(() => {
  db = new Database(':memory:')
  db.exec(SCHEMA_SQL)
})

describe('getNewParkCountsByDate', () => {
  it('returns empty array for empty DB', () => {
    const rows = db.prepare(GET_NEW_PARK_COUNTS_BY_DATE_SQL).all()
    expect(rows).toEqual([])
  })

  it('returns count:1 for a single park worked once', () => {
    insertSession('s1', '2024-01-01')
    insertQso('q1', 's1', 'K-0001')
    const rows = db.prepare(GET_NEW_PARK_COUNTS_BY_DATE_SQL).all()
    expect(rows).toEqual([{ session_date: '2024-01-01', count: 1 }])
  })

  it('same park on two dates only appears on the earlier date', () => {
    insertSession('s1', '2024-01-01')
    insertSession('s2', '2024-01-02')
    insertQso('q1', 's1', 'K-0001', 'W1AW')
    insertQso('q2', 's2', 'K-0001', 'K2ABC')  // same park, different callsign to avoid UNIQUE constraint
    const rows = db.prepare(GET_NEW_PARK_COUNTS_BY_DATE_SQL).all()
    expect(rows).toEqual([{ session_date: '2024-01-01', count: 1 }])
  })

  it('two distinct parks on same date produces count:2', () => {
    insertSession('s1', '2024-01-01')
    insertQso('q1', 's1', 'K-0001')
    insertQso('q2', 's1', 'K-0002', 'W2XYZ')
    const rows = db.prepare(GET_NEW_PARK_COUNTS_BY_DATE_SQL).all()
    expect(rows).toEqual([{ session_date: '2024-01-01', count: 2 }])
  })

  it('new parks spread across multiple dates produces one row per date', () => {
    insertSession('s1', '2024-01-01')
    insertSession('s2', '2024-01-03')
    insertQso('q1', 's1', 'K-0001')
    insertQso('q2', 's1', 'K-0002', 'W2XYZ')
    insertQso('q3', 's2', 'K-0003')
    const rows = db.prepare(GET_NEW_PARK_COUNTS_BY_DATE_SQL).all()
    expect(rows).toEqual([
      { session_date: '2024-01-01', count: 2 },
      { session_date: '2024-01-03', count: 1 },
    ])
  })

  it('QSO with null park_reference is excluded', () => {
    insertSession('s1', '2024-01-01')
    insertQso('q1', 's1', null, 'W1AW')
    const rows = db.prepare(GET_NEW_PARK_COUNTS_BY_DATE_SQL).all()
    expect(rows).toEqual([])
  })

  it('results are ordered ascending by date', () => {
    insertSession('s1', '2024-03-01')
    insertSession('s2', '2024-01-01')
    insertSession('s3', '2024-02-01')
    insertQso('q1', 's1', 'K-0003')
    insertQso('q2', 's2', 'K-0001')
    insertQso('q3', 's3', 'K-0002')
    const rows = db.prepare(GET_NEW_PARK_COUNTS_BY_DATE_SQL).all() as { session_date: string }[]
    const dates = rows.map(r => r.session_date)
    expect(dates).toEqual([...dates].sort())
  })

  it('same park worked many times across sessions uses MIN() for earliest date', () => {
    insertSession('s1', '2024-01-05')
    insertSession('s2', '2024-01-01')
    insertSession('s3', '2024-01-10')
    insertQso('q1', 's1', 'K-0001', 'AA1A')
    insertQso('q2', 's2', 'K-0001', 'BB2B')
    insertQso('q3', 's3', 'K-0001', 'CC3C')
    const rows = db.prepare(GET_NEW_PARK_COUNTS_BY_DATE_SQL).all()
    expect(rows).toEqual([{ session_date: '2024-01-01', count: 1 }])
  })
})

describe('getQsoCountsByDate', () => {
  it('session with no QSOs produces count:0 via LEFT JOIN', () => {
    insertSession('s1', '2024-01-01')
    const rows = db.prepare(GET_QSO_COUNTS_BY_DATE_SQL).all()
    expect(rows).toEqual([{ session_date: '2024-01-01', count: 0 }])
  })

  it('session with multiple QSOs produces correct count', () => {
    insertSession('s1', '2024-01-01')
    insertQso('q1', 's1', 'K-0001', 'W1AW')
    insertQso('q2', 's1', 'K-0002', 'W2XYZ')
    insertQso('q3', 's1', 'K-0003', 'W3ABC')
    const rows = db.prepare(GET_QSO_COUNTS_BY_DATE_SQL).all()
    expect(rows).toEqual([{ session_date: '2024-01-01', count: 3 }])
  })
})
