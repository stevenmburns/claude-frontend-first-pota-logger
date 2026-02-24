export interface HuntSession {
  id: string
  session_date: string  // YYYY-MM-DD
  created_at: string
}

export interface Qso {
  id: string
  hunt_session_id: string
  park_reference: string
  callsign: string
  frequency: number
  band: string
  mode: string
  rst_sent: string
  rst_received: string
  timestamp: string   // ISO 8601 UTC
  created_at: string
  synced: number      // 0 | 1
}

export interface InsertQsoResult {
  success: boolean
  duplicate?: boolean
  id?: string
}
