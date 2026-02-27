export const GET_QSO_COUNTS_BY_DATE_SQL = `
  SELECT hs.session_date, COUNT(q.id) as count
  FROM hunt_sessions hs
  LEFT JOIN qsos q ON q.hunt_session_id = hs.id
  GROUP BY hs.session_date
  ORDER BY hs.session_date`

export const GET_NEW_PARK_COUNTS_BY_DATE_SQL = `
  SELECT first_date as session_date, COUNT(*) as count
  FROM (
    SELECT q.park_reference, MIN(hs.session_date) as first_date
    FROM qsos q
    JOIN hunt_sessions hs ON q.hunt_session_id = hs.id
    WHERE q.park_reference IS NOT NULL
    GROUP BY q.park_reference
  )
  GROUP BY first_date
  ORDER BY first_date`
