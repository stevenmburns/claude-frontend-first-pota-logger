import { describe, expect, it } from 'vitest'
import { defaultRst } from './rstDefaults'

describe('defaultRst', () => {
  it('SSB → 59', () => {
    expect(defaultRst('SSB')).toBe('59')
  })

  it('CW → 599', () => {
    expect(defaultRst('CW')).toBe('599')
  })

  it('FT8 → 599', () => {
    expect(defaultRst('FT8')).toBe('599')
  })

  it('FT4 → 599', () => {
    expect(defaultRst('FT4')).toBe('599')
  })

  it('AM → 59', () => {
    expect(defaultRst('AM')).toBe('59')
  })

  it('ft8 (lowercase) → 599 (case insensitive)', () => {
    expect(defaultRst('ft8')).toBe('599')
  })

  it('FM → 59', () => {
    expect(defaultRst('FM')).toBe('59')
  })

  it('RTTY → 599', () => {
    expect(defaultRst('RTTY')).toBe('599')
  })

  it('PSK31 → 599', () => {
    expect(defaultRst('PSK31')).toBe('599')
  })

  it('CW-R → 599', () => {
    expect(defaultRst('CW-R')).toBe('599')
  })
})
