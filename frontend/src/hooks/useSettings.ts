import { useState, useCallback } from 'react'

export interface Settings {
  operatorCallsign: string
  supabaseUrl: string
  supabaseKey: string
  flrigEnabled: boolean
  flrigProxyPort: number
}

const STORAGE_KEY = 'pota-logger-settings'

const DEFAULTS: Settings = {
  operatorCallsign: '',
  supabaseUrl: '',
  supabaseKey: '',
  flrigEnabled: false,
  flrigProxyPort: 12346,
}

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULTS }
    return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULTS }
  }
}

function saveSettings(settings: Settings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function useSettings() {
  const [settings, setSettingsState] = useState<Settings>(loadSettings)

  const updateSettings = useCallback((partial: Partial<Settings>) => {
    setSettingsState(prev => {
      const next = { ...prev, ...partial }
      saveSettings(next)
      return next
    })
  }, [])

  return { settings, updateSettings }
}
