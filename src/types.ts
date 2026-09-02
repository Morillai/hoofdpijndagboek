export type Overgegaan = 'ochtend' | 'middag' | 'avond' | 'nee' | null

export type DoucheGeholpen = 'ja' | 'nee' | 'beetje' | null

export type DagEntry = {
  datum: string // "2026-09-02"
  opgestaanMetHoofdpijn: boolean
  laterOntstaan: boolean
  score: number // 0-10
  overgegaan: Overgegaan
  activiteiten: string[]
  activiteitAnders: string
  triggers: string[]
  locatie: string[]
  medicatie: string | null
  slaapUren: number | null
  slaapKwaliteit: 'goed' | 'matig' | 'slecht' | null
  nekklachten: boolean
  /** Warme douche na opstaan in de ochtend */
  warmeDouche: boolean | null
  /** Of de warme douche hielp tegen hoofdpijn */
  warmeDoucheGeholpen: DoucheGeholpen
  notitie: string
}

export const ACTIVITEITEN = [
  'School',
  'Voetbal',
  'Gamen',
  'Sport',
  'Beeldscherm',
  'Ontspanning',
  'Vrienden',
  'Concert',
] as const

export const LOCATIES = [
  'Voorhoofd',
  'Achterhoofd',
  'Slapen',
  'Eenzijdig',
  'Hele hoofd',
] as const

export const MEDICATIE_OPTIES = [
  'Paracetamol',
  'Anders',
] as const

export function emptyEntry(datum: string): DagEntry {
  return {
    datum,
    opgestaanMetHoofdpijn: false,
    laterOntstaan: false,
    score: 0,
    overgegaan: null,
    activiteiten: [],
    activiteitAnders: '',
    triggers: [],
    locatie: [],
    medicatie: null,
    slaapUren: null,
    slaapKwaliteit: null,
    nekklachten: false,
    warmeDouche: null,
    warmeDoucheGeholpen: null,
    notitie: '',
  }
}

/** Merge stored entry with defaults (for oudere backups). */
export function normalizeEntry(partial: Partial<DagEntry> & { datum: string }): DagEntry {
  return { ...emptyEntry(partial.datum), ...partial }
}

export function activiteitenLabel(entry: DagEntry): string {
  const parts = [...entry.activiteiten]
  const anders = entry.activiteitAnders?.trim()
  if (anders) parts.push(anders)
  return parts.join(', ')
}
