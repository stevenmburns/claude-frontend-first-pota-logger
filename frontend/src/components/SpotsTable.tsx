import type { AnnotatedSpot } from '../hooks/useSpots'
import { freqKhzToBand } from '../utils/bandMap'

interface SpotsTableProps {
  spots: AnnotatedSpot[]
  onSelectSpot: (spot: AnnotatedSpot) => void
}

const th: React.CSSProperties = {
  padding: '0.4rem 0.6rem', textAlign: 'left', color: '#a6adc8',
  fontSize: '0.8rem', fontWeight: 600, borderBottom: '1px solid #444',
  position: 'sticky', top: 0, background: '#181825',
}

const td: React.CSSProperties = {
  padding: '0.35rem 0.6rem', fontSize: '0.85rem', borderBottom: '1px solid #2a2a3d',
}

export function SpotsTable({ spots, onSelectSpot }: SpotsTableProps) {
  if (spots.length === 0) {
    return <p style={{ color: '#a6adc8', padding: '1rem' }}>No spots found.</p>
  }

  return (
    <div style={{ overflowY: 'auto', flex: 1 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={th}>Activator</th>
            <th style={th}>Park</th>
            <th style={th}>Freq</th>
            <th style={th}>Band</th>
            <th style={th}>Mode</th>
            <th style={th}>Time</th>
            <th style={th}>Comments</th>
          </tr>
        </thead>
        <tbody>
          {spots.map(spot => {
            const freqNum = parseFloat(spot.frequency)
            const band = freqKhzToBand(freqNum)
            const rowBg = spot.hunted ? '#1e3a1e' : undefined
            return (
              <tr
                key={spot.spotId}
                onClick={() => onSelectSpot(spot)}
                style={{ background: rowBg, cursor: 'pointer' }}
                onMouseEnter={e => {
                  if (!spot.hunted) (e.currentTarget as HTMLElement).style.background = '#252535'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = rowBg ?? ''
                }}
              >
                <td style={{ ...td, color: spot.hunted ? '#a6e3a1' : '#89b4fa', fontWeight: 600 }}>
                  {spot.hunted ? '✓ ' : ''}{spot.activator}
                </td>
                <td style={{ ...td, color: '#cdd6f4' }}>
                  <span style={{ fontWeight: 600 }}>{spot.reference}</span>
                  <span style={{ color: '#a6adc8', fontSize: '0.78rem', marginLeft: 4 }}>
                    {spot.parkName}
                  </span>
                </td>
                <td style={{ ...td, color: '#f9e2af' }}>{spot.frequency}</td>
                <td style={{ ...td, color: '#cba6f7' }}>{band}</td>
                <td style={{ ...td, color: '#94e2d5' }}>{spot.mode}</td>
                <td style={{ ...td, color: '#a6adc8', fontSize: '0.78rem' }}>
                  {new Date(spot.spotTime).toISOString().slice(11, 16)}Z
                </td>
                <td style={{ ...td, color: '#a6adc8', fontSize: '0.78rem', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {spot.comments}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
