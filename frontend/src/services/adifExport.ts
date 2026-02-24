import type { Qso } from '../db/types'

function adifField(tag: string, value: string | number): string {
  const str = String(value)
  return `<${tag}:${str.length}>${str}`
}

export function generateAdif(qsos: Qso[]): string {
  const header = [
    'ADIF Export from POTA Logger',
    adifField('ADIF_VER', '3.1.4'),
    adifField('PROGRAMID', 'POTA Logger'),
    '<EOH>',
    '',
  ].join('\n')

  const records = qsos.map(q => {
    const dt = new Date(q.timestamp)
    const date = dt.toISOString().slice(0, 10).replace(/-/g, '')
    const time = dt.toISOString().slice(11, 16).replace(':', '')

    return [
      adifField('CALL', q.callsign),
      adifField('QSO_DATE', date),
      adifField('TIME_ON', time),
      adifField('BAND', q.band),
      adifField('MODE', q.mode),
      adifField('FREQ', q.frequency.toString()),
      adifField('RST_SENT', q.rst_sent),
      adifField('RST_RCVD', q.rst_received),
      adifField('SIG', 'POTA'),
      adifField('SIG_INFO', q.park_reference),
      '<EOR>',
    ].join(' ')
  })

  return header + records.join('\n') + '\n'
}

export function downloadAdif(qsos: Qso[]): void {
  const content = generateAdif(qsos)
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `hunt_${date}.adi`
  a.click()
  URL.revokeObjectURL(url)
}
