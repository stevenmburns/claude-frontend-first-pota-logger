import { describe, expect, it } from 'vitest'
import { formatSpotTimeUtc } from './spotTime'

describe('formatSpotTimeUtc', () => {
  it('returns HH:MM UTC for ISO format without timezone marker', () => {
    expect(formatSpotTimeUtc('2026-02-24T18:30:00')).toBe('18:30')
  })

  it('returns HH:MM UTC for space-separated format', () => {
    expect(formatSpotTimeUtc('2026-02-24 18:30:00')).toBe('18:30')
  })

  it('does not shift time by local timezone offset', () => {
    // 01:00 UTC should always display as 01:00, not shifted to local time
    expect(formatSpotTimeUtc('2026-02-24T01:00:00')).toBe('01:00')
  })

  it('handles strings already marked as UTC with Z suffix', () => {
    expect(formatSpotTimeUtc('2026-02-24T18:30:00Z')).toBe('18:30')
  })
})
