import { useState, useRef, useCallback } from 'react'
import { SpotsPanel } from './SpotsPanel'
import { QsoForm } from './QsoForm'
import { QsoTable } from './QsoTable'
import { SettingsPanel } from './SettingsPanel'
import type { AnnotatedSpot } from '../hooks/useSpots'
import type { Qso, HuntSession } from '../db/types'
import type { Settings } from '../hooks/useSettings'
import { downloadAdif } from '../services/adifExport'

interface AppShellProps {
  session: HuntSession
  callsign: string
  spots: AnnotatedSpot[]
  spotsLoading: boolean
  spotsError: Error | null
  onRefreshSpots: () => void
  qsos: Qso[]
  onQsoLogged: () => void
  onQsoDeleted: () => void
  settings: Settings
  onUpdateSettings: (partial: Partial<Settings>) => void
}

export function AppShell({
  session, callsign, spots, spotsLoading, spotsError, onRefreshSpots,
  qsos, onQsoLogged, onQsoDeleted, settings, onUpdateSettings,
}: AppShellProps) {
  const [selectedSpot, setSelectedSpot] = useState<AnnotatedSpot | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [splitPct, setSplitPct] = useState(66.7)
  const containerRef = useRef<HTMLDivElement>(null)

  const onDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const onMouseMove = (ev: MouseEvent) => {
      const container = containerRef.current
      if (!container) return
      const { left, width } = container.getBoundingClientRect()
      const pct = ((ev.clientX - left) / width) * 100
      setSplitPct(Math.min(Math.max(pct, 20), 85))
    }
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [])

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#1e1e2e', color: '#cdd6f4' }}>
      {/* Header */}
      <header style={{
        padding: '0.6rem 1.2rem', background: '#181825', borderBottom: '1px solid #333',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.2rem', color: '#89b4fa' }}>POTA Hunt Log</h1>
          <span style={{ color: '#a6adc8', fontSize: '0.9rem' }}>{callsign}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={() => downloadAdif(qsos)}
            disabled={qsos.length === 0}
            style={{
              background: '#313244', border: '1px solid #555', borderRadius: 4,
              color: '#cdd6f4', padding: '0.3rem 0.7rem', cursor: 'pointer', fontSize: '0.85rem',
            }}
          >
            Export ADIF ({qsos.length})
          </button>
          <button
            onClick={() => setShowSettings(true)}
            style={{
              background: '#313244', border: '1px solid #555', borderRadius: 4,
              color: '#cdd6f4', padding: '0.3rem 0.7rem', cursor: 'pointer', fontSize: '0.85rem',
            }}
          >
            ⚙ Settings
          </button>
        </div>
      </header>

      {/* Two-column body */}
      <div ref={containerRef} style={{ flex: 1, display: 'grid', gridTemplateColumns: `${splitPct}% 4px 1fr`, overflow: 'hidden' }}>
        {/* Left: Spots */}
        <div style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '0.5rem' }}>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: '#cba6f7' }}>Active Spots</h2>
          <SpotsPanel
            spots={spots}
            loading={spotsLoading}
            error={spotsError}
            onSelectSpot={spot => setSelectedSpot(spot)}
            onRefresh={onRefreshSpots}
          />
        </div>

        {/* Draggable divider */}
        <div
          onMouseDown={onDividerMouseDown}
          style={{
            cursor: 'col-resize', background: '#333', width: 4,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#585b70' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#333' }}
        />

        {/* Right: Log form + QSO table */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '0.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ margin: '0 0 0.6rem', fontSize: '1rem', color: '#cba6f7' }}>
              Log QSO
              {selectedSpot && (
                <span style={{ color: '#a6adc8', fontWeight: 400, fontSize: '0.85rem', marginLeft: 8 }}>
                  (from spot: {selectedSpot.activator})
                </span>
              )}
            </h2>
            <QsoForm
              session={session}
              selectedSpot={selectedSpot}
              onQsoLogged={onQsoLogged}
            />
          </div>

          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: '#cba6f7' }}>
              Today's QSOs ({qsos.length})
            </h2>
            <QsoTable qsos={qsos} onDeleted={onQsoDeleted} />
          </div>
        </div>
      </div>

      {showSettings && (
        <SettingsPanel
          settings={settings}
          onUpdate={onUpdateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}
