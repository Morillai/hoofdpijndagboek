import type { DagEntry } from './types'

const STORAGE_KEY = 'hoofdpijndagboek-entries'

export function loadAll(): Record<string, DagEntry> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, DagEntry>
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
      all[entry.datum] = entry
      count++
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  return count
}

export function replaceAll(entries: Record<string, DagEntry>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}
