import { getDb } from '../db/db.client'
import type { Qso } from '../db/types'

interface QsoTableProps {
  qsos: Qso[]
  onDeleted: () => void
}

const th: React.CSSProperties = {
  padding: '0.4rem 0.6rem', textAlign: 'left', color: '#a6adc8',
  fontSize: '0.78rem', fontWeight: 600, borderBottom: '1px solid #444',
}

const td: React.CSSProperties = {
  padding: '0.3rem 0.6rem', fontSize: '0.82rem', borderBottom: '1px solid #2a2a3d',
  color: '#cdd6f4',
}

function utcTime(iso: string): string {
  return new Date(iso).toISOString().slice(11, 16)
}

export function QsoTable({ qsos, onDeleted }: QsoTableProps) {
  if (qsos.length === 0) {
    return <p style={{ color: '#a6adc8', fontSize: '0.85rem' }}>No QSOs logged yet.</p>
  }

  async function handleDelete(id: string) {
    const db = await getDb()
    await db.deleteQso(id)
    onDeleted()
  }

  return (
    <div style={{ overflowY: 'auto', maxHeight: 300 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={th}>Time (UTC)</th>
            <th style={th}>Callsign</th>
            <th style={th}>Park</th>
            <th style={th}>Freq</th>
            <th style={th}>Band</th>
            <th style={th}>Mode</th>
            <th style={th}>RST S/R</th>
            <th style={th}></th>
          </tr>
        </thead>
        <tbody>
          {qsos.map(q => (
            <tr key={q.id}>
              <td style={{ ...td, color: '#a6adc8' }}>{utcTime(q.timestamp)}</td>
              <td style={{ ...td, color: '#89b4fa', fontWeight: 600 }}>{q.callsign}</td>
              <td style={{ ...td }}>{q.park_reference}</td>
              <td style={{ ...td, color: '#f9e2af' }}>{q.frequency}</td>
              <td style={{ ...td, color: '#cba6f7' }}>{q.band}</td>
              <td style={{ ...td, color: '#94e2d5' }}>{q.mode}</td>
              <td style={{ ...td }}>{q.rst_sent}/{q.rst_received}</td>
              <td style={{ ...td }}>
                <button
                  onClick={() => handleDelete(q.id)}
                  title="Delete QSO"
                  style={{
                    background: 'transparent', border: 'none', color: '#f38ba8',
                    cursor: 'pointer', fontSize: '0.8rem', padding: '0.1rem 0.3rem',
                  }}
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
