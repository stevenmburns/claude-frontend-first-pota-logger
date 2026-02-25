import { describe, expect, it } from 'vitest'
import { sortSpots } from './sortSpots'
import type { AnnotatedSpot } from '../hooks/useSpots'

function makeSpot(frequency: string, mode: string, spotTime: string): AnnotatedSpot {
  return {
    spotId: 0,
    activator: 'K1ABC',
    name: 'Test Park',
    reference: 'K-0001',
    parkName: 'Test Park',
    frequency,
    mode,
    source: 'test',
    comments: '',
    spotTime,
    expire: 0,
    hunted: false,
    newPark: false,
  }
}

describe('sortSpots', () => {
  it('sorts by frequency numerically ascending', () => {
    const spots = [
      makeSpot('14225.0', 'SSB', '2026-02-24T12:00:00'),
      makeSpot('7035.0', 'CW', '2026-02-24T12:00:00'),
      makeSpot('21310.0', 'SSB', '2026-02-24T12:00:00'),
    ]
    const result = sortSpots(spots)
    expect(result.map(s => s.frequency)).toEqual(['7035.0', '14225.0', '21310.0'])
  })

  it('breaks frequency ties by mode ascending', () => {
    const spots = [
      makeSpot('14225.0', 'SSB', '2026-02-24T12:00:00'),
      makeSpot('14225.0', 'CW', '2026-02-24T12:00:00'),
      makeSpot('14225.0', 'FT8', '2026-02-24T12:00:00'),
    ]
    const result = sortSpots(spots)
    expect(result.map(s => s.mode)).toEqual(['CW', 'FT8', 'SSB'])
  })

  it('breaks frequency+mode ties by time ascending', () => {
    const spots = [
      makeSpot('14225.0', 'SSB', '2026-02-24T14:00:00'),
      makeSpot('14225.0', 'SSB', '2026-02-24T12:00:00'),
      makeSpot('14225.0', 'SSB', '2026-02-24T13:00:00'),
    ]
    const result = sortSpots(spots)
    expect(result.map(s => s.spotTime)).toEqual([
      '2026-02-24T12:00:00',
      '2026-02-24T13:00:00',
      '2026-02-24T14:00:00',
    ])
  })

  it('sorts numeric frequency correctly (not lexicographic)', () => {
    // Lexicographic would put 9000 before 14000; numeric should not
    const spots = [
      makeSpot('14000.0', 'CW', '2026-02-24T12:00:00'),
      makeSpot('9000.0', 'CW', '2026-02-24T12:00:00'),
    ]
    const result = sortSpots(spots)
    expect(result.map(s => s.frequency)).toEqual(['9000.0', '14000.0'])
  })
})
