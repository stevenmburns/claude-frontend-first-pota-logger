import type { AnnotatedSpot } from '../hooks/useSpots'

export function sortSpots(spots: AnnotatedSpot[]): AnnotatedSpot[] {
  return [...spots].sort((a, b) => {
    const freqDiff = parseFloat(a.frequency) - parseFloat(b.frequency)
    if (freqDiff !== 0) return freqDiff

    const modeCmp = a.mode.localeCompare(b.mode)
    if (modeCmp !== 0) return modeCmp

    return a.spotTime.localeCompare(b.spotTime)
  })
}
