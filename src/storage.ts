import type { DagEntry } from './types'
import { emptyEntry } from './types'

const STORAGE_KEY = 'hoofdpijndagboek-entries'

function normalizeAll(raw: Record<string, Partial<DagEntry>>): Record<string, DagEntry> {
  const out: Record<string, DagEntry> = {}
  for (const [datum, entry] of Object.entries(raw)) {
    out[datum] = { ...emptyEntry(datum), ...entry, datum }
  }
  return out
}

export function loadAll(): Record<string, DagEntry> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return normalizeAll(JSON.parse(raw) as Record<string, Partial<DagEntry>>)
  } catch {
    return {}
  }
}

export function saveEntry(entry: DagEntry): void {
  const all = loadAll()
  all[entry.datum] = entry
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function deleteEntry(datum: string): void {
  const all = loadAll()
  delete all[datum]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function getEntry(datum: string): DagEntry | undefined {
  return loadAll()[datum]
}

export function getSortedEntries(): DagEntry[] {
  return Object.values(loadAll()).sort((a, b) => b.datum.localeCompare(a.datum))
}

export function importEntries(entries: DagEntry[], merge = true): number {
  const all = merge ? loadAll() : {}
  let count = 0
  for (const entry of entries) {
    if (entry?.datum) {
      all[entry.datum] = { ...emptyEntry(entry.datum), ...entry, datum: entry.datum }
      count++
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  return count
}

export function replaceAll(entries: Record<string, DagEntry>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}
