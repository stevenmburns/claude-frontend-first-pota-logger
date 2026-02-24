import { useState, useEffect } from 'react'
import { getDb } from '../db/db.client'
import { generateUuid } from '../utils/uuid'
import { freqMhzToBand, freqKhzToBand } from '../utils/bandMap'
import { defaultRst } from '../utils/rstDefaults'
import { useParkLookup } from '../hooks/useParkLookup'
import type { AnnotatedSpot } from '../hooks/useSpots'

const MODES = ['SSB', 'CW', 'FT8', 'FT4', 'AM', 'FM', 'RTTY', 'PSK31']

interface QsoFormProps {
  sessionId: string
  selectedSpot: AnnotatedSpot | null
  onQsoLogged: () => void
}

interface FormState {
  parkReference: string
  callsign: string
  frequency: string
  band: string
  mode: string
  rstSent: string
  rstReceived: string
}

function emptyForm(): FormState {
  return {
    parkReference: '', callsign: '', frequency: '', band: '',
    mode: 'SSB', rstSent: '59', rstReceived: '59',
  }
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.4rem 0.5rem', background: '#313244',
  border: '1px solid #555', borderRadius: 4, color: '#cdd6f4',
  fontSize: '0.9rem', boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block', color: '#a6adc8', fontSize: '0.78rem', marginBottom: 2,
}

export function QsoForm({ sessionId, selectedSpot, onQsoLogged }: QsoFormProps) {
  const [form, setForm] = useState<FormState>(emptyForm())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { park } = useParkLookup(form.parkReference)

  // Prefill from selected spot
  // POTA API returns frequency in kHz; form stores MHz for ADIF compatibility
  useEffect(() => {
    if (!selectedSpot) return
    const freqKhz = parseFloat(selectedSpot.frequency)
    const freqMhz = freqKhz / 1000
    const mode = selectedSpot.mode || 'SSB'
    const rst = defaultRst(mode)
    setForm({
      parkReference: selectedSpot.reference,
      callsign: selectedSpot.activator,
      frequency: freqMhz.toFixed(3),
      band: freqKhzToBand(freqKhz),
      mode,
      rstSent: rst,
      rstReceived: rst,
    })
    setError(null)
  }, [selectedSpot])

  function handleChange(field: keyof FormState, value: string) {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      // Auto-detect band from frequency
      if (field === 'frequency') {
        const mhz = parseFloat(value)
        if (!isNaN(mhz)) next.band = freqMhzToBand(mhz)
      }
      // Auto-update RST when mode changes
      if (field === 'mode') {
        const rst = defaultRst(value)
        next.rstSent = rst
        next.rstReceived = rst
      }
      return next
    })
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.callsign.trim() || !form.parkReference.trim()) return
    setSubmitting(true)
    setError(null)

    try {
      const db = await getDb()
      const now = new Date().toISOString()
      const result = await db.insertQso({
        id: generateUuid(),
        hunt_session_id: sessionId,
        park_reference: form.parkReference.trim().toUpperCase(),
        callsign: form.callsign.trim().toUpperCase(),
        frequency: parseFloat(form.frequency) || 0,
        band: form.band,
        mode: form.mode,
        rst_sent: form.rstSent,
        rst_received: form.rstReceived,
        timestamp: now,
        created_at: now,
      })

      if (result.duplicate) {
        setError('Duplicate QSO: already logged this station/park/band combination.')
        return
      }

      setForm(emptyForm())
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
      onQsoLogged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log QSO')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <div>
          <label style={labelStyle}>Park Reference *</label>
          <input
            style={inputStyle}
            value={form.parkReference}
            onChange={e => handleChange('parkReference', e.target.value)}
            placeholder="K-1234"
          />
          {park && (
            <div style={{ fontSize: '0.75rem', color: '#a6e3a1', marginTop: 2 }}>
              {park.name}
            </div>
          )}
        </div>
        <div>
          <label style={labelStyle}>Callsign *</label>
          <input
            style={{ ...inputStyle, textTransform: 'uppercase' }}
            value={form.callsign}
            onChange={e => handleChange('callsign', e.target.value)}
            placeholder="W1AW"
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
        <div>
          <label style={labelStyle}>Frequency (MHz)</label>
          <input
            style={inputStyle}
            type="number" step="0.001"
            value={form.frequency}
            onChange={e => handleChange('frequency', e.target.value)}
            placeholder="14.225"
          />
        </div>
        <div>
          <label style={labelStyle}>Band</label>
          <input
            style={{ ...inputStyle, background: '#252535', color: '#a6adc8' }}
            readOnly value={form.band}
            placeholder="auto"
          />
        </div>
        <div>
          <label style={labelStyle}>Mode</label>
          <select
            style={inputStyle}
            value={form.mode}
            onChange={e => handleChange('mode', e.target.value)}
          >
            {MODES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <div>
          <label style={labelStyle}>RST Sent</label>
          <input
            style={inputStyle}
            value={form.rstSent}
            onChange={e => handleChange('rstSent', e.target.value)}
          />
        </div>
        <div>
          <label style={labelStyle}>RST Received</label>
          <input
            style={inputStyle}
            value={form.rstReceived}
            onChange={e => handleChange('rstReceived', e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div style={{ color: '#f38ba8', fontSize: '0.85rem', padding: '0.3rem 0' }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ color: '#a6e3a1', fontSize: '0.85rem', padding: '0.3rem 0' }}>
          QSO logged!
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !form.callsign.trim() || !form.parkReference.trim()}
        style={{
          padding: '0.55rem', background: '#89b4fa', border: 'none', borderRadius: 4,
          fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer',
          opacity: submitting ? 0.7 : 1,
        }}
      >
        {submitting ? 'Logging…' : 'Log QSO'}
      </button>
    </form>
  )
}
