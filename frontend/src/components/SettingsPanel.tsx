import { useState } from 'react'
import type { Settings } from '../hooks/useSettings'

interface SettingsPanelProps {
  settings: Settings
  onUpdate: (partial: Partial<Settings>) => void
  onClose: () => void
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.4rem 0.5rem', background: '#313244',
  border: '1px solid #555', borderRadius: 4, color: '#cdd6f4',
  fontSize: '0.9rem', boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block', color: '#a6adc8', fontSize: '0.8rem', marginBottom: 3,
}

export function SettingsPanel({ settings, onUpdate, onClose }: SettingsPanelProps) {
  const [form, setForm] = useState(settings)

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    onUpdate({
      operatorCallsign: form.operatorCallsign.trim().toUpperCase(),
      supabaseUrl: form.supabaseUrl.trim(),
      supabaseKey: form.supabaseKey.trim(),
    })
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{
        background: '#1e1e2e', border: '1px solid #444', borderRadius: 8,
        padding: '2rem', minWidth: 380, color: '#cdd6f4',
      }}>
        <h2 style={{ marginTop: 0 }}>Settings</h2>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Operator Callsign</label>
            <input
              style={{ ...inputStyle, textTransform: 'uppercase' }}
              value={form.operatorCallsign}
              onChange={e => setForm(f => ({ ...f, operatorCallsign: e.target.value }))}
              placeholder="W1AW"
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Supabase URL (optional)</label>
            <input
              style={inputStyle}
              type="url"
              value={form.supabaseUrl}
              onChange={e => setForm(f => ({ ...f, supabaseUrl: e.target.value }))}
              placeholder="https://xxxx.supabase.co"
            />
          </div>
          <div>
            <label style={labelStyle}>Supabase Anon Key (optional)</label>
            <input
              style={inputStyle}
              value={form.supabaseKey}
              onChange={e => setForm(f => ({ ...f, supabaseKey: e.target.value }))}
              placeholder="eyJ..."
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.5rem 1rem', background: '#313244', border: '1px solid #555',
                borderRadius: 4, color: '#cdd6f4', cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '0.5rem 1rem', background: '#89b4fa', border: 'none',
                borderRadius: 4, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
