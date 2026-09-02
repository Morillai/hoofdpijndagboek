import { useMemo, useRef, useState } from 'react'
import type { DagEntry } from '../types'
import {
  berekenSamenvatting,
  downloadBlob,
  filterByPeriode,
  formatDatumNl,
  toCsv,
  toJsonBackup,
  type Periode,
} from '../export'

type Props = {
  entries: DagEntry[]
  onImport: (entries: DagEntry[]) => void
}

const PERIODE_LABELS: { id: Periode; label: string }[] = [
  { id: '4weken', label: '4 weken' },
  { id: '3maanden', label: '3 maanden' },
  { id: 'alles', label: 'Alles' },
]

export function Export({ entries, onImport }: Props) {
  const [periode, setPeriode] = useState<Periode>('4weken')
  const [message, setMessage] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => filterByPeriode(entries, periode), [entries, periode])
  const samenvatting = useMemo(() => berekenSamenvatting(filtered), [filtered])

  function exportCsv() {
    downloadBlob(toCsv(filtered), `hoofdpijn-${periode}.csv`, 'text/csv;charset=utf-8')
    setMessage('CSV gedownload')
  }

  function exportJson() {
    downloadBlob(
      toJsonBackup(filtered),
      `hoofdpijn-backup-${periode}.json`,
      'application/json',
    )
    setMessage('JSON-backup gedownload')
  }

  function printOverview() {
    window.print()
  }

  async function handleImport(file: File) {
    try {
      const text = await file.text()
      const data = JSON.parse(text) as { entries?: DagEntry[] } | DagEntry[]
      const list = Array.isArray(data) ? data : data.entries
      if (!list || !Array.isArray(list)) {
        setMessage('Ongeldig backup-bestand')
        return
      }
      onImport(list)
      setMessage(`${list.length} dagen geïmporteerd`)
    } catch {
      setMessage('Kon bestand niet lezen')
    }
  }

  return (
    <div className="export">
      <div className="periode-tabs no-print">
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

      <section className="card samenvatting print-section">
        <h3>Samenvatting</h3>
        {filtered.length === 0 ? (
          <p className="empty-state">Geen data in deze periode.</p>
        ) : (
          <dl className="stats">
            <div>
              <dt>Dagen gelogd</dt>
              <dd>{samenvatting.totaalDagen}</dd>
            </div>
            <div>
              <dt>Met hoofdpijn</dt>
              <dd>
                {samenvatting.dagenMetHoofdpijn} ({samenvatting.percentageHoofdpijn}%)
              </dd>
            </div>
            <div>
              <dt>Gem. score</dt>
              <dd>{samenvatting.gemiddeldeScore}</dd>
            </div>
            <div>
              <dt>Nekklachten</dt>
              <dd>{samenvatting.nekklachtenDagen} dagen</dd>
            </div>
            <div>
              <dt>Medicatie</dt>
              <dd>{samenvatting.medicatieDagen} dagen</dd>
            </div>
            {samenvatting.topActiviteiten.length > 0 && (
              <div className="full">
                <dt>Top activiteiten</dt>
                <dd>
                  {samenvatting.topActiviteiten.map((t) => `${t.naam} (${t.count})`).join(', ')}
                </dd>
              </div>
            )}
          </dl>
        )}
      </section>

      <div className="export-actions no-print">
        <button type="button" className="btn btn-primary" onClick={printOverview} disabled={filtered.length === 0}>
          Print / PDF voor fysio
        </button>
        <button type="button" className="btn btn-secondary" onClick={exportCsv} disabled={filtered.length === 0}>
          Download CSV
        </button>
        <button type="button" className="btn btn-secondary" onClick={exportJson} disabled={filtered.length === 0}>
          JSON backup
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => fileRef.current?.click()}>
          Importeer backup
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void handleImport(f)
            e.target.value = ''
          }}
        />
      </div>

      {message && (
        <p className="toast no-print" role="status">
          {message}
        </p>
      )}

      <section className="card print-section print-table-wrap">
        <h3>Dagoverzicht</h3>
        {filtered.length === 0 ? (
          <p className="empty-state">Geen invoeren.</p>
        ) : (
          <div className="table-scroll">
            <table className="export-table">
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Score</th>
                  <th>Opgestaan</th>
                  <th>Later</th>
                  <th>Over</th>
                  <th>Locatie</th>
                  <th>Activiteiten</th>
                  <th>Medicatie</th>
                  <th>Slaap</th>
                  <th>Nek</th>
                  <th>Notitie</th>
                </tr>
              </thead>
              <tbody>
                {[...filtered]
                  .sort((a, b) => a.datum.localeCompare(b.datum))
                  .map((e) => (
                    <tr key={e.datum}>
                      <td>{formatDatumNl(e.datum)}</td>
                      <td>{e.score}</td>
                      <td>{e.opgestaanMetHoofdpijn ? 'ja' : ''}</td>
                      <td>{e.laterOntstaan ? 'ja' : ''}</td>
                      <td>{e.overgegaan ?? ''}</td>
                      <td>{e.locatie.join(', ')}</td>
                      <td>{e.activiteiten.join(', ')}</td>
                      <td>{e.medicatie ?? ''}</td>
                      <td>
                        {[e.slaapUren != null ? `${e.slaapUren}u` : '', e.slaapKwaliteit ?? '']
                          .filter(Boolean)
                          .join(' / ')}
                      </td>
                      <td>{e.nekklachten ? 'ja' : ''}</td>
                      <td>{e.notitie}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="hint no-print">
        Tip: bij &quot;Print / PDF&quot; kies je op iPhone &quot;Bewaar als PDF&quot; of &quot;Afdrukken&quot; om
        een overzicht voor de fysio te maken.
      </p>
    </div>
  )
}
