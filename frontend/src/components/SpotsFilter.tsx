interface SpotsFilterProps {
  band: string
  mode: string
  onBandChange: (b: string) => void
  onModeChange: (m: string) => void
}

const BANDS = ['', '160m', '80m', '60m', '40m', '30m', '20m', '17m', '15m', '12m', '10m', '6m', '2m', '70cm']
const MODES = ['', 'SSB', 'CW', 'FT8', 'FT4', 'AM', 'FM', 'RTTY', 'PSK31']

const sel: React.CSSProperties = {
  background: '#313244', color: '#cdd6f4', border: '1px solid #555',
  borderRadius: 4, padding: '0.3rem 0.5rem', fontSize: '0.9rem',
}

export function SpotsFilter({ band, mode, onBandChange, onModeChange }: SpotsFilterProps) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.5rem 0' }}>
      <label style={{ color: '#a6adc8', fontSize: '0.85rem' }}>Band:</label>
      <select style={sel} value={band} onChange={e => onBandChange(e.target.value)}>
        {BANDS.map(b => <option key={b} value={b}>{b || 'All'}</option>)}
      </select>
      <label style={{ color: '#a6adc8', fontSize: '0.85rem' }}>Mode:</label>
      <select style={sel} value={mode} onChange={e => onModeChange(e.target.value)}>
        {MODES.map(m => <option key={m} value={m}>{m || 'All'}</option>)}
      </select>
    </div>
  )
}
