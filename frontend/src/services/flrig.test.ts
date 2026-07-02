import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setFrequency } from './flrig'

describe('setFrequency', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response()))
  })

  it('sends a POST with <double> type for a whole-number kHz value', async () => {
    await setFrequency(14074, 12346)

    const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toBe('http://localhost:12346')
    expect(init.method).toBe('POST')
    expect(init.body).toContain('<double>14074000</double>')
    expect(init.body).not.toContain('<int>')
    expect(init.body).not.toContain('<i4>')
  })

  it('converts kHz to Hz correctly', async () => {
    await setFrequency(7.074, 12346)

    const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(init.body).toContain('<double>7074</double>')
  })

  it('uses the provided proxy port', async () => {
    await setFrequency(14074, 9999)

    const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toBe('http://localhost:9999')
  })

  it('sets both the main (VFO A) and sub (VFO B)', async () => {
    await setFrequency(14074, 12346)

    const calls = (fetch as ReturnType<typeof vi.fn>).mock.calls
    expect(calls).toHaveLength(2)
    expect(calls[0][1].body).toContain('<methodName>rig.set_vfoA</methodName>')
    expect(calls[0][1].body).toContain('<double>14074000</double>')
    expect(calls[1][1].body).toContain('<methodName>rig.set_vfoB</methodName>')
    expect(calls[1][1].body).toContain('<double>14074000</double>')
  })
})
