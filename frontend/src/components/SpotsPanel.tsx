import { useState } from 'react'
import { SpotsFilter } from './SpotsFilter'
import { SpotsTable } from './SpotsTable'
import type { AnnotatedSpot } from '../hooks/useSpots'
import { freqKhzToBand } from '../utils/bandMap'
import { sortSpots } from '../utils/sortSpots'

interface SpotsPanelProps {
  spots: AnnotatedSpot[]
  loading: boolean
  error: Error | null
  onSelectSpot: (spot: AnnotatedSpot) => void
  onRefresh: () => void
}

export function SpotsPanel({ spots, loading, error, onSelectSpot, onRefresh }: SpotsPanelProps) {
  const [bandFilter, setBandFilter] = useState('')
  const [modeFilter, setModeFilter] = useState('')

  const filtered = sortSpots(spots.filter(s => {
    if (bandFilter && freqKhzToBand(parseFloat(s.frequency)) !== bandFilter) return false
    if (modeFilter && s.mode.toUpperCase() !== modeFilter.toUpperCase()) return false
    return true
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.5rem' }}>
        <SpotsFilter
          band={bandFilter} mode={modeFilter}
          onBandChange={setBandFilter} onModeChange={setModeFilter}
        />
        <button
          onClick={onRefresh}
          style={{
            background: '#313244', border: '1px solid #555', borderRadius: 4,
            color: '#cdd6f4', padding: '0.3rem 0.7rem', cursor: 'pointer', fontSize: '0.85rem',
          }}
        >
          ↺ Refresh
        </button>
      </div>

      {loading && <p style={{ color: '#a6adc8', padding: '1rem' }}>Loading spots…</p>}
      {error && <p style={{ color: '#f38ba8', padding: '1rem' }}>Error: {error.message}</p>}
      {!loading && !error && (
        <SpotsTable spots={filtered} onSelectSpot={onSelectSpot} />
      )}
    </div>
  )
}
