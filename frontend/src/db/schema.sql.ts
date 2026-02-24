export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS hunt_sessions (
  id TEXT PRIMARY KEY,
  session_date TEXT UNIQUE,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS qsos (
  id TEXT PRIMARY KEY,
  hunt_session_id TEXT REFERENCES hunt_sessions(id),
  park_reference TEXT,
  callsign TEXT,
  frequency REAL,
  band TEXT,
  mode TEXT,
  rst_sent TEXT,
  rst_received TEXT,
  timestamp TEXT,
  created_at TEXT,
  synced INTEGER DEFAULT 0,
  UNIQUE(hunt_session_id, callsign, park_reference, band)
);
`
