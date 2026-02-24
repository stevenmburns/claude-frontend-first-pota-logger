import { describe, expect, it } from 'vitest'
import { freqKhzToBand, freqMhzToBand } from './bandMap'

describe('freqKhzToBand', () => {
  it('14241 kHz → 20m (the original bug case)', () => {
    expect(freqKhzToBand(14241)).toBe('20m')
  })

  it('7074 kHz → 40m', () => {
    expect(freqKhzToBand(7074)).toBe('40m')
  })

  it('28500 kHz → 10m', () => {
    expect(freqKhzToBand(28500)).toBe('10m')
  })

  it('3750 kHz → 80m', () => {
    expect(freqKhzToBand(3750)).toBe('80m')
  })

  it('999 kHz → empty string (out of range)', () => {
    expect(freqKhzToBand(999)).toBe('')
  })

  it('1800 kHz → 160m (band edge)', () => {
    expect(freqKhzToBand(1800)).toBe('160m')
  })

  it('2000 kHz → 160m (band edge)', () => {
    expect(freqKhzToBand(2000)).toBe('160m')
  })

  it('5370 kHz → 60m', () => {
    expect(freqKhzToBand(5370)).toBe('60m')
  })

  it('10125 kHz → 30m', () => {
    expect(freqKhzToBand(10125)).toBe('30m')
  })

  it('18100 kHz → 17m', () => {
    expect(freqKhzToBand(18100)).toBe('17m')
  })

  it('21200 kHz → 15m', () => {
    expect(freqKhzToBand(21200)).toBe('15m')
  })

  it('24940 kHz → 12m', () => {
    expect(freqKhzToBand(24940)).toBe('12m')
  })

  it('51000 kHz → 6m', () => {
    expect(freqKhzToBand(51000)).toBe('6m')
  })

  it('145000 kHz → 2m', () => {
    expect(freqKhzToBand(145000)).toBe('2m')
  })

  it('435000 kHz → 70cm', () => {
    expect(freqKhzToBand(435000)).toBe('70cm')
  })
})

describe('freqMhzToBand', () => {
  it('14.225 MHz → 20m', () => {
    expect(freqMhzToBand(14.225)).toBe('20m')
  })

  it('7.074 MHz → 40m', () => {
    expect(freqMhzToBand(7.074)).toBe('40m')
  })

  it('1.85 MHz → 160m', () => {
    expect(freqMhzToBand(1.85)).toBe('160m')
  })

  it('0.5 MHz → empty string (out of range)', () => {
    expect(freqMhzToBand(0.5)).toBe('')
  })
})
