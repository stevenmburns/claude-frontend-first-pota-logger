-- POTA Logger — Supabase schema migration
-- Run this in the Supabase SQL editor for your project.

-- ── Tables ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS hunt_sessions (
  id          TEXT PRIMARY KEY,
  session_date TEXT UNIQUE NOT NULL,
  created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS qsos (
  id              TEXT PRIMARY KEY,
  hunt_session_id TEXT NOT NULL REFERENCES hunt_sessions(id),
  park_reference  TEXT NOT NULL,
  callsign        TEXT NOT NULL,
  frequency       REAL,
  band            TEXT,
  mode            TEXT,
  rst_sent        TEXT,
  rst_received    TEXT,
  timestamp       TEXT,
  created_at      TEXT NOT NULL,
  -- Prevent duplicate contacts within the same session
  UNIQUE (hunt_session_id, callsign, park_reference, band)
);

-- ── Row Level Security ──────────────────────────────────────────────────────
-- Anonymous access: anyone with the project anon key can read and write.
-- Tighten these policies later if you add Supabase Auth.

ALTER TABLE hunt_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE qsos          ENABLE ROW LEVEL SECURITY;

-- hunt_sessions
CREATE POLICY "anon read hunt_sessions"
  ON hunt_sessions FOR SELECT TO anon USING (true);

CREATE POLICY "anon insert hunt_sessions"
  ON hunt_sessions FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon update hunt_sessions"
  ON hunt_sessions FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- qsos
CREATE POLICY "anon read qsos"
  ON qsos FOR SELECT TO anon USING (true);

CREATE POLICY "anon insert qsos"
  ON qsos FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon update qsos"
  ON qsos FOR UPDATE TO anon USING (true) WITH CHECK (true);
