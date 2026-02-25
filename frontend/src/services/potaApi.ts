const BASE = 'https://api.pota.app'

export interface PotaSpot {
  spotId: number
  activator: string
  name: string
  reference: string
  parkName: string
  frequency: string
  mode: string
  source: string
  comments: string
  spotTime: string
  expire: number
}

export interface PotaPark {
  reference: string
  name: string
  parktypeDesc: string
  locationDesc: string
}

export async function fetchActiveSpots(): Promise<PotaSpot[]> {
  const resp = await fetch(`${BASE}/spot/activator`)
  if (!resp.ok) throw new Error(`POTA spots fetch failed: ${resp.status}`)
  return resp.json()
}

export async function lookupPark(ref: string): Promise<PotaPark | null> {
  const resp = await fetch(`${BASE}/park/${encodeURIComponent(ref)}`)
  if (resp.status === 404) return null
  if (!resp.ok) throw new Error(`POTA park lookup failed: ${resp.status}`)
  return resp.json()
}

export interface PotaUser {
  callsign: string
  name: string
}

export async function lookupUser(callsign: string): Promise<PotaUser | null> {
  const resp = await fetch(`${BASE}/stats/user/${encodeURIComponent(callsign)}`)
  if (resp.status === 404) return null
  if (!resp.ok) throw new Error(`POTA user lookup failed: ${resp.status}`)
  return resp.json()
}
