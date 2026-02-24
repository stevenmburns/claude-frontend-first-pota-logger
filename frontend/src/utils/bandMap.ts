const BAND_EDGES: Array<{ min: number; max: number; band: string }> = [
  { min: 1800, max: 2000, band: '160m' },
  { min: 3500, max: 4000, band: '80m' },
  { min: 5330, max: 5410, band: '60m' },
  { min: 7000, max: 7300, band: '40m' },
  { min: 10100, max: 10150, band: '30m' },
  { min: 14000, max: 14350, band: '20m' },
  { min: 18068, max: 18168, band: '17m' },
  { min: 21000, max: 21450, band: '15m' },
  { min: 24890, max: 24990, band: '12m' },
  { min: 28000, max: 29700, band: '10m' },
  { min: 50000, max: 54000, band: '6m' },
  { min: 144000, max: 148000, band: '2m' },
  { min: 430000, max: 440000, band: '70cm' },
]

export function freqKhzToBand(freqKhz: number): string {
  const match = BAND_EDGES.find(e => freqKhz >= e.min && freqKhz <= e.max)
  return match?.band ?? ''
}

export function freqMhzToBand(freqMhz: number): string {
  return freqKhzToBand(freqMhz * 1000)
}
