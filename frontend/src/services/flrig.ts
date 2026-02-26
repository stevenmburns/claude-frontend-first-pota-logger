export async function setFrequency(freqKhz: number, proxyPort = 12346): Promise<void> {
  const hz = freqKhz * 1000
  const xml = `<?xml version="1.0"?><methodCall><methodName>rig.set_vfo</methodName><params><param><value><double>${hz}</double></value></param></params></methodCall>`
  await fetch(`http://localhost:${proxyPort}`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml' },
    body: xml,
  })
}
