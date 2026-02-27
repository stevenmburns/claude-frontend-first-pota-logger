import { useEffect, useState } from 'react'
import { ActivityCalendar } from 'react-activity-calendar'
import { getDb } from '../db/db.client'

type Activity = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }

function countToLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0
  if (count <= 3) return 1
  if (count <= 9) return 2
  if (count <= 19) return 3
  return 4
}

function buildActivityData(rows: { session_date: string; count: number }[]): Activity[] {
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
    activities.push({ date, count, level: countToLevel(count) })
    cursor.setDate(cursor.getDate() + 1)
  }

  return activities
}

export function HeatmapPanel() {
  const [activities, setActivities] = useState<Activity[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getDb()
      .then(db => db.getQsoCountsByDate())
      .then(rows => setActivities(buildActivityData(rows)))
      .catch(e => setError(String(e)))
  }, [])

  if (error) {
    return <div style={{ color: '#f38ba8' }}>Error loading heatmap: {error}</div>
  }

  if (activities === null) {
    return <div style={{ color: '#a6adc8' }}>Loading…</div>
  }

  if (activities.length === 0) {
    return <div style={{ color: '#a6adc8' }}>No QSO history found.</div>
  }

  return (
    <div>
      <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', color: '#cba6f7' }}>QSO Activity</h2>
      <ActivityCalendar
        data={activities}
        theme={{
          light: ['#ebedf0', '#216e39', '#30a14e', '#40c463', '#9be9a8'],
          dark: ['#161b22', '#216e39', '#30a14e', '#40c463', '#9be9a8'],
        }}
        colorScheme="dark"
        showWeekdayLabels
      />
    </div>
  )
}
