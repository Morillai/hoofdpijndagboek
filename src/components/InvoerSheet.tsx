import { useEffect, useState } from 'react'
import {
  ACTIVITEITEN,
  emptyEntry,
  LOCATIES,
  MEDICATIE_OPTIES,
  normalizeEntry,
  type DagEntry,
  type DoucheGeholpen,
  type Overgegaan,
} from '../types'
import { formatDatumNl, scoreColor } from '../export'

type Props = {
  datum: string
  existing?: DagEntry
  onSave: (entry: DagEntry) => void
  onDelete: (datum: string) => void
  onClose: () => void
}

export function InvoerSheet({ datum, existing, onSave, onDelete, onClose }: Props) {
  const [entry, setEntry] = useState<DagEntry>(() =>
    existing ? normalizeEntry(existing) : emptyEntry(datum),
  )

  useEffect(() => {
    setEntry(existing ? normalizeEntry(existing) : emptyEntry(datum))
  }, [datum, existing])

  function toggle(list: string[], item: string): string[] {
    return list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
  }

  function set<K extends keyof DagEntry>(key: K, value: DagEntry[K]) {
    setEntry((e) => ({ ...e, [key]: value }))
  }

  function handleSave() {
    onSave({ ...entry, triggers: [] })
    onClose()
  }

  function handleDelete() {
    if (confirm('Invoer voor deze dag verwijderen?')) {
      onDelete(datum)
      onClose()
    }
  }

  const hasHoofdpijn = entry.opgestaanMetHoofdpijn || entry.laterOntstaan || entry.score > 0

  return (
    <div className="sheet-overlay" onClick={onClose} role="presentation">
      <div
        className="sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="sheet-title"
      >
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h2 id="sheet-title">{formatDatumNl(datum)}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Sluiten">
            ✕
          </button>
        </div>

        <div className="sheet-body">
          <section className="field">
            <label className="field-label">Hoofdpijn?</label>
            <div className="toggle-row">
              <button
                type="button"
                className={`chip-btn ${entry.opgestaanMetHoofdpijn ? 'active' : ''}`}
                onClick={() => set('opgestaanMetHoofdpijn', !entry.opgestaanMetHoofdpijn)}
              >
                Opgestaan met pijn
              </button>
              <button
                type="button"
                className={`chip-btn ${entry.laterOntstaan ? 'active' : ''}`}
                onClick={() => set('laterOntstaan', !entry.laterOntstaan)}
              >
                Later ontstaan
              </button>
            </div>
          </section>

          <section className="field">
            <label className="field-label">
              Score: <strong style={{ color: scoreColor(entry.score) }}>{entry.score}</strong>
            </label>
            <div className="score-pad" role="group" aria-label="Pijnscore 0 tot 10">
              {Array.from({ length: 11 }, (_, n) => (
                <button
                  key={n}
                  type="button"
                  className={`score-btn ${entry.score === n ? 'active' : ''}`}
                  style={{
                    backgroundColor: entry.score === n ? scoreColor(n) : undefined,
                    borderColor: scoreColor(n),
                    color: entry.score === n ? '#fff' : scoreColor(n),
                  }}
                  onClick={() => set('score', n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </section>

          <section className="field">
            <label className="field-label">Warme douche na opstaan?</label>
            <div className="chip-group">
              <button
                type="button"
                className={`chip-btn ${entry.warmeDouche === true ? 'active' : ''}`}
                onClick={() => set('warmeDouche', true)}
              >
                Ja
              </button>
              <button
                type="button"
                className={`chip-btn ${entry.warmeDouche === false ? 'active' : ''}`}
                onClick={() => {
                  setEntry((e) => ({ ...e, warmeDouche: false, warmeDoucheGeholpen: null }))
                }}
              >
                Nee
              </button>
            </div>
            {entry.warmeDouche === true && (
              <div className="sub-field">
                <span className="sub-label">Heeft de douche geholpen?</span>
                <div className="chip-group">
                  {(['ja', 'beetje', 'nee'] as Exclude<DoucheGeholpen, null>[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      className={`chip-btn ${entry.warmeDoucheGeholpen === g ? 'active' : ''}`}
                      onClick={() =>
                        set('warmeDoucheGeholpen', entry.warmeDoucheGeholpen === g ? null : g)
                      }
                    >
                      {g === 'ja' ? 'Ja' : g === 'nee' ? 'Nee' : 'Beetje'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {hasHoofdpijn && (
            <>
              <section className="field">
                <label className="field-label">Overgegaan?</label>
                <div className="chip-group">
                  {(['ochtend', 'middag', 'avond', 'nee'] as Exclude<Overgegaan, null>[]).map((o) => (
                    <button
                      key={o}
                      type="button"
                      className={`chip-btn ${entry.overgegaan === o ? 'active' : ''}`}
                      onClick={() => set('overgegaan', entry.overgegaan === o ? null : o)}
                    >
                      {o === 'nee' ? 'Niet over' : o.charAt(0).toUpperCase() + o.slice(1)}
                    </button>
                  ))}
                </div>
              </section>

              <section className="field">
                <label className="field-label">Locatie pijn</label>
                <div className="chip-group">
                  {LOCATIES.map((l) => (
                    <button
                      key={l}
                      type="button"
                      className={`chip-btn ${entry.locatie.includes(l) ? 'active' : ''}`}
                      onClick={() => set('locatie', toggle(entry.locatie, l))}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}

          <section className="field">
            <label className="field-label">Activiteiten</label>
            <div className="chip-group">
              {ACTIVITEITEN.map((a) => (
                <button
                  key={a}
                  type="button"
                  className={`chip-btn ${entry.activiteiten.includes(a) ? 'active' : ''}`}
                  onClick={() => set('activiteiten', toggle(entry.activiteiten, a))}
                >
                  {a}
                </button>
              ))}
            </div>
            <div className="sub-field">
              <label className="sub-label" htmlFor="activiteit-anders">
                Anders
              </label>
              <input
                id="activiteit-anders"
                type="text"
                className="text-input"
                placeholder="Bijv. museum, reis…"
                value={entry.activiteitAnders}
                onChange={(e) => set('activiteitAnders', e.target.value)}
              />
            </div>
          </section>

          <section className="field">
            <label className="field-label">Medicatie</label>
            <div className="chip-group">
              <button
                type="button"
                className={`chip-btn ${entry.medicatie === null ? 'active' : ''}`}
                onClick={() => set('medicatie', null)}
              >
                Geen
              </button>
              {MEDICATIE_OPTIES.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`chip-btn ${entry.medicatie === m ? 'active' : ''}`}
                  onClick={() => set('medicatie', m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </section>

          <section className="field">
            <label className="field-label">Slaap</label>
            <div className="row-2">
              <div>
                <span className="sub-label">Uren</span>
                <input
                  type="number"
                  min={0}
                  max={24}
                  step={0.5}
                  value={entry.slaapUren ?? ''}
                  placeholder="—"
                  onChange={(e) =>
                    set('slaapUren', e.target.value === '' ? null : Number(e.target.value))
                  }
                  className="text-input"
                />
              </div>
              <div>
                <span className="sub-label">Kwaliteit</span>
                <div className="chip-group">
                  {(['goed', 'matig', 'slecht'] as const).map((k) => (
                    <button
                      key={k}
                      type="button"
                      className={`chip-btn ${entry.slaapKwaliteit === k ? 'active' : ''}`}
                      onClick={() =>
                        set('slaapKwaliteit', entry.slaapKwaliteit === k ? null : k)
                      }
                    >
                      {k.charAt(0).toUpperCase() + k.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="field">
            <button
              type="button"
              className={`chip-btn full ${entry.nekklachten ? 'active' : ''}`}
              onClick={() => set('nekklachten', !entry.nekklachten)}
            >
              Nekklachten / spierspanning
            </button>
          </section>

          <section className="field">
            <label className="field-label" htmlFor="notitie">
              Notitie
            </label>
            <textarea
              id="notitie"
              className="text-input textarea"
              rows={3}
              placeholder="Bijzonderheden…"
              value={entry.notitie}
              onChange={(e) => set('notitie', e.target.value)}
            />
          </section>
        </div>

        <div className="sheet-footer">
          {existing && (
            <button type="button" className="btn btn-danger" onClick={handleDelete}>
              Verwijderen
            </button>
          )}
          <button type="button" className="btn btn-primary" onClick={handleSave}>
            Opslaan
          </button>
        </div>
      </div>
    </div>
  )
}
