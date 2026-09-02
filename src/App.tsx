import { useCallback, useEffect, useState } from 'react'
import type { DagEntry } from './types'
import { deleteEntry, importEntries, loadAll, saveEntry } from './storage'
import { Kalender } from './components/Kalender'
import { InvoerSheet } from './components/InvoerSheet'
import { Log } from './components/Log'
import { Export } from './components/Export'

type Tab = 'kalender' | 'log' | 'export'

export default function App() {
  const [tab, setTab] = useState<Tab>('kalender')
  const [entriesMap, setEntriesMap] = useState<Record<string, DagEntry>>({})
  const [selectedDatum, setSelectedDatum] = useState<string | null>(null)

  const refresh = useCallback(() => {
    setEntriesMap(loadAll())
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const sortedFromMap = Object.values(entriesMap).sort((a, b) => b.datum.localeCompare(a.datum))

  function handleSelectDay(datum: string) {
    setSelectedDatum(datum)
  }

  function handleSave(entry: DagEntry) {
    saveEntry(entry)
    refresh()
  }

  function handleDelete(datum: string) {
    deleteEntry(datum)
    refresh()
  }

  function handleImport(list: DagEntry[]) {
    importEntries(list, true)
    refresh()
  }

  return (
    <div className="app">
      <header className="app-header no-print">
        <h1>Hoofdpijndagboek</h1>
      </header>

      <main className="app-main">
        {tab === 'kalender' && (
          <Kalender entries={entriesMap} onSelectDay={handleSelectDay} />
        )}
        {tab === 'log' && <Log entries={sortedFromMap} onSelect={handleSelectDay} />}
        {tab === 'export' && <Export entries={sortedFromMap} onImport={handleImport} />}
      </main>

      <nav className="tab-bar no-print" aria-label="Hoofdnavigatie">
        <button
          type="button"
          className={tab === 'kalender' ? 'active' : ''}
          onClick={() => setTab('kalender')}
        >
          <span className="tab-icon">📅</span>
          Kalender
        </button>
        <button
          type="button"
          className={tab === 'log' ? 'active' : ''}
          onClick={() => setTab('log')}
        >
          <span className="tab-icon">📋</span>
          Log
        </button>
        <button
          type="button"
          className={tab === 'export' ? 'active' : ''}
          onClick={() => setTab('export')}
        >
          <span className="tab-icon">📤</span>
          Export
        </button>
      </nav>

      {selectedDatum && (
        <InvoerSheet
          datum={selectedDatum}
          existing={entriesMap[selectedDatum]}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setSelectedDatum(null)}
        />
      )}
    </div>
  )
}
