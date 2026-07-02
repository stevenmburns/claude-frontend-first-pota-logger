function setVfoCall(method: string, hz: number, proxyPort: number): Promise<Response> {
  const xml = `<?xml version="1.0"?><methodCall><methodName>${method}</methodName><params><param><value><double>${hz}</double></value></param></params></methodCall>`
  return fetch(`http://localhost:${proxyPort}`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml' },
    body: xml,
  })
}

export async function setFrequency(freqKhz: number, proxyPort = 12346): Promise<void> {
  const hz = freqKhz * 1000
  // Set both the main (VFO A) and sub (VFO B) so the rig lands on the frequency
  // regardless of which VFO is currently active.
  await setVfoCall('rig.set_vfoA', hz, proxyPort)
  await setVfoCall('rig.set_vfoB', hz, proxyPort)
}
