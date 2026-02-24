/**
 * Format a POTA API spotTime string as "HH:MM" in UTC.
 *
 * The POTA API returns spotTime in UTC but without a timezone suffix
 * (e.g. "2026-02-24T18:30:00"). Without a suffix, JavaScript's Date
 * constructor treats the string as local time, causing an incorrect UTC
 * offset to be applied. Appending "Z" forces UTC interpretation.
 */
export function formatSpotTimeUtc(spotTime: string): string {
  const utcStr = /Z$|[+-]\d{2}:\d{2}$/.test(spotTime)
    ? spotTime
    : spotTime.replace(' ', 'T') + 'Z'
  return new Date(utcStr).toISOString().slice(11, 16)
}
