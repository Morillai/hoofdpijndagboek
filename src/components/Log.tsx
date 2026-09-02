import { useMemo, useState } from 'react'
import type { DagEntry } from '../types'
import { filterByPeriode, formatDatumNl, scoreColor, type Periode } from '../export'

type Props = {
  entries: DagEntry[]
  onSelect: (datum: string) => void
}

const PERIODE_LABELS: { id: Periode; label: string }[] = [
  { id: '4weken', label: '4 weken' },
  { id: '3maanden', label: '3 maanden' },
  { id: 'alles', label: 'Alles' },
]

export function Log({ entries, onSelect }: Props) {
  const [periode, setPeriode] = useState<Periode>('4weken')

  const filtered = useMemo(() => filterByPeriode(entries, periode), [entries, periode])

  return (
    <div className="log">
      <div className="periode-tabs">
        {PERIODE_LABELS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`periode-tab ${periode === p.id ? 'active' : ''}`}
            onClick={() => setPeriode(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="empty-state">Nog geen invoeren in deze periode. Tik op een dag in de kalender.</p>
      ) : (
        <ul className="log-list">
          {filtered.map((e) => (
            <li key={e.datum}>
              <button type="button" className="log-item" onClick={() => onSelect(e.datum)}>
                <span
                  className="score-badge"
                  style={{ backgroundColor: scoreColor(e.score) }}
                >
                  {e.score}
                </span>
                <div className="log-item-body">
                  <div className="log-item-date">{formatDatumNl(e.datum)}</div>
                  <div className="log-item-meta">
                    {e.opgestaanMetHoofdpijn && <span>Opgestaan</span>}
                    {e.laterOntstaan && <span>Later</span>}
                    {e.overgegaan && e.overgegaan !== 'nee' && (
                      <span>Over: {e.overgegaan}</span>
                    )}
                    {e.overgegaan === 'nee' && <span>Niet over</span>}
                    {e.nekklachten && <span>Nek</span>}
                    {e.warmeDouche === true && (
                      <span>
                        Douche
                        {e.warmeDoucheGeholpen ? `: ${e.warmeDoucheGeholpen}` : ''}
                      </span>
                    )}
                    {e.medicatie && <span>{e.medicatie}</span>}
                    {(e.activiteiten.length > 0 || e.activiteitAnders?.trim()) && (
                      <span>
                        {[...e.activiteiten, e.activiteitAnders?.trim()]
                          .filter(Boolean)
                          .slice(0, 2)
                          .join(', ')}
                      </span>
                    )}
                  </div>
                  {e.notitie && <div className="log-item-note">{e.notitie}</div>}
                </div>
                <span className="chevron">›</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
