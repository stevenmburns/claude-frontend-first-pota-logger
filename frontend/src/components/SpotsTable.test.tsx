import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SpotsTable } from './SpotsTable'
import type { AnnotatedSpot } from '../hooks/useSpots'

const spot: AnnotatedSpot = {
  spotId: 1,
  activator: 'K1ABC',
  name: 'Test Park',
  reference: 'K-0001',
  parkName: 'Test Park',
  frequency: '14225.0',
  mode: 'SSB',
  source: 'test',
  comments: '',
  spotTime: '2026-02-24T18:30:00',
  expire: 0,
  hunted: false,
  newPark: false,
}

describe('SpotsTable', () => {
  it('displays "Time (UTC)" as the column heading', () => {
    render(<SpotsTable spots={[spot]} onSelectSpot={vi.fn()} />)
    expect(screen.getByText('Time (UTC)')).toBeInTheDocument()
  })

  it('does not append a trailing Z to the time value', () => {
    render(<SpotsTable spots={[spot]} onSelectSpot={vi.fn()} />)
    // Should show "18:30" not "18:30Z"
    expect(screen.queryByText(/18:30Z/)).not.toBeInTheDocument()
    expect(screen.getByText('18:30')).toBeInTheDocument()
  })
})
