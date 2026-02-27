import { useEffect, useState } from 'react'
import { ActivityCalendar } from 'react-activity-calendar'
import { getDb } from '../db/db.client'

type Activity = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }

function qsoCountToLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0
  if (count <= 3) return 1
  if (count <= 9) return 2
  if (count <= 19) return 3
  return 4
}

function newParkCountToLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0
  if (count === 1) return 1
  if (count === 2) return 2
  if (count === 3) return 3
  return 4
}

function buildActivityData(
  rows: { session_date: string; count: number }[],
  toLevel: (count: number) => 0 | 1 | 2 | 3 | 4
): Activity[] {
  if (rows.length === 0) return []

  const countByDate = new Map<string, number>()
  for (const row of rows) {
    countByDate.set(row.session_date, row.count)
  }

  const earliest = rows[0].session_date
  const today = new Date().toISOString().slice(0, 10)

  const activities: Activity[] = []
  const cursor = new Date(earliest)
  const end = new Date(today)

  while (cursor <= end) {
    const date = cursor.toISOString().slice(0, 10)
    const count = countByDate.get(date) ?? 0
    activities.push({ date, count, level: toLevel(count) })
    cursor.setDate(cursor.getDate() + 1)
  }

  return activities
}

function splitByYear(activities: Activity[]): [number, Activity[]][] {
  const countByDate = new Map<string, { count: number; level: 0 | 1 | 2 | 3 | 4 }>()
  for (const a of activities) {
    countByDate.set(a.date, { count: a.count, level: a.level })
  }

  const years = [...new Set(activities.map(a => parseInt(a.date.slice(0, 4))))]
  const today = new Date().toISOString().slice(0, 10)
  const currentYear = new Date().getFullYear()

  return years
    .sort((a, b) => b - a)
    .map(year => {
      const start = new Date(`${year}-01-01`)
      const end = year === currentYear ? new Date(today) : new Date(`${year}-12-31`)
      const yearData: Activity[] = []
      const cursor = new Date(start)
      while (cursor <= end) {
        const date = cursor.toISOString().slice(0, 10)
        const existing = countByDate.get(date)
        yearData.push(existing ? { date, ...existing } : { date, count: 0, level: 0 })
        cursor.setDate(cursor.getDate() + 1)
      }
      return [year, yearData] as [number, Activity[]]
    })
}

const THEME = {
  light: ['#ebedf0', '#216e39', '#30a14e', '#40c463', '#9be9a8'],
  dark: ['#161b22', '#216e39', '#30a14e', '#40c463', '#9be9a8'],
}

function YearlyCalendar({ activities }: { activities: Activity[] }) {
  const years = splitByYear(activities)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {years.map(([year, data]) => (
        <div key={year}>
          <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#a6adc8' }}>{year}</div>
          <ActivityCalendar
            data={data}
            theme={THEME}
            colorScheme="dark"
            showWeekdayLabels
            showMonthLabels
          />
        </div>
      ))}
    </div>
  )
}

export function HeatmapPanel() {
  const [qsoActivities, setQsoActivities] = useState<Activity[] | null>(null)
  const [newParkActivities, setNewParkActivities] = useState<Activity[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getDb().then(db =>
      Promise.all([db.getQsoCountsByDate(), db.getNewParkCountsByDate()])
    ).then(([qsoRows, parkRows]) => {
      setQsoActivities(buildActivityData(qsoRows, qsoCountToLevel))
      setNewParkActivities(buildActivityData(parkRows, newParkCountToLevel))
    }).catch(e => setError(String(e)))
  }, [])

  if (error) {
    return <div style={{ color: '#f38ba8' }}>Error loading heatmap: {error}</div>
  }

  if (qsoActivities === null || newParkActivities === null) {
    return <div style={{ color: '#a6adc8' }}>Loading…</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      <section>
        <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', color: '#cba6f7' }}>QSO Activity</h2>
        {qsoActivities.length === 0
          ? <div style={{ color: '#a6adc8' }}>No QSO history found.</div>
          : <YearlyCalendar activities={qsoActivities} />}
      </section>

      <section>
        <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', color: '#cba6f7' }}>New Parks Hunted</h2>
        {newParkActivities.length === 0
          ? <div style={{ color: '#a6adc8' }}>No park history found.</div>
          : <YearlyCalendar activities={newParkActivities} />}
      </section>
    </div>
  )
}
