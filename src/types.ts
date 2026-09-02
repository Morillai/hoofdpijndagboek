export type Overgegaan = 'ochtend' | 'middag' | 'avond' | 'nee' | null

export type DagEntry = {
  datum: string // "2026-09-02"
  opgestaanMetHoofdpijn: boolean
  laterOntstaan: boolean
  score: number // 0-10
  overgegaan: Overgegaan
  activiteiten: string[]
  triggers: string[]
  locatie: string[]
  medicatie: string | null
  slaapUren: number | null
  slaapKwaliteit: 'goed' | 'matig' | 'slecht' | null
  nekklachten: boolean
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
  'Ibuprofen',
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
    triggers: [],
    locatie: [],
    medicatie: null,
    slaapUren: null,
    slaapKwaliteit: null,
    nekklachten: false,
    notitie: '',
  }
}
