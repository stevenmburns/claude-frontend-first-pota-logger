import { useState } from 'react'

interface SetupPromptProps {
  onSave: (callsign: string) => void
}

export function SetupPrompt({ onSave }: SetupPromptProps) {
  const [callsign, setCallsign] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = callsign.trim().toUpperCase()
    if (trimmed) onSave(trimmed)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{
        background: '#1e1e2e', border: '1px solid #444', borderRadius: 8,
        padding: '2rem', minWidth: 320, color: '#cdd6f4',
      }}>
        <h2 style={{ marginTop: 0 }}>Welcome to POTA Logger</h2>
        <p style={{ color: '#a6adc8' }}>Enter your operator callsign to get started.</p>
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: 4 }}>Your Callsign</label>
          <input
            autoFocus
            value={callsign}
            onChange={e => setCallsign(e.target.value)}
            placeholder="e.g. W1AW"
            style={{
              width: '100%', padding: '0.5rem', fontSize: '1.1rem',
              background: '#313244', border: '1px solid #555', borderRadius: 4,
              color: '#cdd6f4', textTransform: 'uppercase', boxSizing: 'border-box',
            }}
          />
          <button
            type="submit"
            disabled={!callsign.trim()}
            style={{
              marginTop: '1rem', width: '100%', padding: '0.6rem',
              background: '#89b4fa', border: 'none', borderRadius: 4,
              fontSize: '1rem', cursor: 'pointer', fontWeight: 600,
            }}
          >
            Start Logging
          </button>
        </form>
      </div>
    </div>
  )
}
