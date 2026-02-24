import { useEffect } from 'react'
import { useSettings } from './hooks/useSettings'
import { useTodaySession } from './hooks/useTodaySession'
import { useQsos } from './hooks/useQsos'
import { useSpots } from './hooks/useSpots'
import { SetupPrompt } from './components/SetupPrompt'
import { AppShell } from './components/AppShell'
import { initSupabase, pushUnsyncedQsos } from './services/supabaseSync'

export default function App() {
  const { settings, updateSettings } = useSettings()
  const { session, loading: sessionLoading, error: sessionError } = useTodaySession()
  const { qsos, refresh: refreshQsos } = useQsos(session?.id ?? null)
  const { spots, loading: spotsLoading, error: spotsError, refresh: refreshSpots } = useSpots(qsos)

  // Init Supabase and push any unsynced rows on startup
  useEffect(() => {
    initSupabase(settings.supabaseUrl, settings.supabaseKey)
    pushUnsyncedQsos()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.supabaseUrl, settings.supabaseKey])

  if (!settings.operatorCallsign) {
    return (
      <SetupPrompt
        onSave={callsign => updateSettings({ operatorCallsign: callsign })}
      />
    )
  }

  if (sessionLoading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#1e1e2e', color: '#a6adc8',
      }}>
        Initializing database…
      </div>
    )
  }

  if (sessionError || !session) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#1e1e2e', color: '#f38ba8',
      }}>
        Database error: {sessionError?.message ?? 'Could not create session'}
      </div>
    )
  }

  return (
    <AppShell
      sessionId={session.id}
      callsign={settings.operatorCallsign}
      spots={spots}
      spotsLoading={spotsLoading}
      spotsError={spotsError}
      onRefreshSpots={refreshSpots}
      qsos={qsos}
      onQsoLogged={refreshQsos}
      onQsoDeleted={refreshQsos}
      settings={settings}
      onUpdateSettings={updateSettings}
    />
  )
}
