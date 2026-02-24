const CW_MODES = new Set(['CW', 'CW-R'])
const DIGI_MODES = new Set(['FT8', 'FT4', 'PSK31', 'PSK63', 'RTTY', 'WSPR', 'JT65', 'JT9'])

export function defaultRst(mode: string): string {
  const upper = mode.toUpperCase()
  if (CW_MODES.has(upper) || DIGI_MODES.has(upper)) return '599'
  return '59'
}
