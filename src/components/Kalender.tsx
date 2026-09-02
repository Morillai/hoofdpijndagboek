import { useMemo, useState } from 'react'
import type { DagEntry } from '../types'
import { scoreColor, toDateStr } from '../export'

const WEEKDAYS = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo']
const MONTHS = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december',
]

type Props = {
  entries: Record<string, DagEntry>
  onSelectDay: (datum: string) => void
}

export function Kalender({ entries, onSelectDay }: Props) {
  const today = toDateStr(new Date())
  const [cursor, setCursor] = useState(() => {
    const n = new Date()
    return { year: n.getFullYear(), month: n.getMonth() }
  })

  const days = useMemo(() => {
    const first = new Date(cursor.year, cursor.month, 1)
    // Monday = 0
    const startPad = (first.getDay() + 6) % 7
    const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate()
    const cells: { datum: string | null; day: number | null }[] = []
    for (let i = 0; i < startPad; i++) cells.push({ datum: null, day: null })
    for (let d = 1; d <= daysInMonth; d++) {
      const datum = `${cursor.year}-${String(cursor.month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      cells.push({ datum, day: d })
    }
    while (cells.length % 7 !== 0) cells.push({ datum: null, day: null })
    return cells
  }, [cursor])

  function prev() {
    setCursor((c) => {
      if (c.month === 0) return { year: c.year - 1, month: 11 }
      return { year: c.year, month: c.month - 1 }
    })
  }

  function next() {
    setCursor((c) => {
      if (c.month === 11) return { year: c.year + 1, month: 0 }
      return { year: c.year, month: c.month + 1 }
    })
  }

  return (
    <div className="kalender">
      <div className="kalender-header">
        <button type="button" className="nav-btn" onClick={prev} aria-label="Vorige maand">
          ‹
        </button>
        <h2>
          {MONTHS[cursor.month]} {cursor.year}
        </h2>
        <button type="button" className="nav-btn" onClick={next} aria-label="Volgende maand">
          ›
        </button>
      </div>

      <div className="kalender-weekdays">
        {WEEKDAYS.map((w) => (
          <div key={w} className="weekday">
            {w}
          </div>
        ))}
      </div>

      <div className="kalender-grid">
        {days.map((cell, i) => {
          if (!cell.datum) {
            return <div key={`empty-${i}`} className="day-cell empty" />
          }
          const entry = entries[cell.datum]
          const isToday = cell.datum === today
          const hasEntry = !!entry
          const bg = hasEntry ? scoreColor(entry.score) : undefined
          return (
            <button
              key={cell.datum}
              type="button"
              className={`day-cell ${hasEntry ? 'has-entry' : ''} ${isToday ? 'today' : ''}`}
              style={bg ? { backgroundColor: bg, color: entry.score > 0 ? '#fff' : undefined } : undefined}
              onClick={() => onSelectDay(cell.datum!)}
            >
              <span className="day-num">{cell.day}</span>
              {hasEntry && entry.score > 0 && <span className="day-score">{entry.score}</span>}
            </button>
          )
        })}
      </div>

      <div className="kalender-legend">
        <span className="legend-item"><span className="dot" style={{ background: '#94a3b8' }} /> geen / 0</span>
        <span className="legend-item"><span className="dot" style={{ background: '#22c55e' }} /> 1–3</span>
        <span className="legend-item"><span className="dot" style={{ background: '#eab308' }} /> 4–5</span>
        <span className="legend-item"><span className="dot" style={{ background: '#f97316' }} /> 6–7</span>
        <span className="legend-item"><span className="dot" style={{ background: '#ef4444' }} /> 8–10</span>
      </div>
    </div>
  )
}
