import type { DagEntry } from './types'

export type Periode = '4weken' | '3maanden' | 'alles'

export function filterByPeriode(entries: DagEntry[], periode: Periode): DagEntry[] {
  if (periode === 'alles') return entries
  const now = new Date()
  const cutoff = new Date(now)
  if (periode === '4weken') cutoff.setDate(cutoff.getDate() - 28)
  else cutoff.setMonth(cutoff.getMonth() - 3)
  const cutoffStr = toDateStr(cutoff)
  return entries.filter((e) => e.datum >= cutoffStr)
}

export function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function formatDatumNl(datum: string): string {
  const [y, m, d] = datum.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('nl-NL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export type Samenvatting = {
  totaalDagen: number
  dagenMetHoofdpijn: number
  percentageHoofdpijn: number
  gemiddeldeScore: number
  topActiviteiten: { naam: string; count: number }[]
  nekklachtenDagen: number
  medicatieDagen: number
}

function topCounts(lists: string[][], limit = 5): { naam: string; count: number }[] {
  const map = new Map<string, number>()
  for (const list of lists) {
    for (const item of list) {
      map.set(item, (map.get(item) ?? 0) + 1)
    }
  }
  return [...map.entries()]
    .map(([naam, count]) => ({ naam, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

export function berekenSamenvatting(entries: DagEntry[]): Samenvatting {
  const metPijn = entries.filter((e) => e.opgestaanMetHoofdpijn || e.laterOntstaan || e.score > 0)
  const scores = entries.map((e) => e.score)
  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

  return {
    totaalDagen: entries.length,
    dagenMetHoofdpijn: metPijn.length,
    percentageHoofdpijn: entries.length ? Math.round((metPijn.length / entries.length) * 100) : 0,
    gemiddeldeScore: Math.round(avg * 10) / 10,
    topActiviteiten: topCounts(entries.map((e) => e.activiteiten)),
    nekklachtenDagen: entries.filter((e) => e.nekklachten).length,
    medicatieDagen: entries.filter((e) => e.medicatie).length,
  }
}

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function toCsv(entries: DagEntry[]): string {
  const headers = [
    'Datum',
    'Opgestaan met hoofdpijn',
    'Later ontstaan',
    'Score',
    'Overgegaan',
    'Activiteiten',
    'Locatie',
    'Medicatie',
    'Slaap uren',
    'Slaap kwaliteit',
    'Nekklachten',
    'Notitie',
  ]
  const rows = entries
    .slice()
    .sort((a, b) => a.datum.localeCompare(b.datum))
    .map((e) =>
      [
        e.datum,
        e.opgestaanMetHoofdpijn ? 'ja' : 'nee',
        e.laterOntstaan ? 'ja' : 'nee',
        String(e.score),
        e.overgegaan ?? '',
        e.activiteiten.join('; '),
        e.locatie.join('; '),
        e.medicatie ?? '',
        e.slaapUren != null ? String(e.slaapUren) : '',
        e.slaapKwaliteit ?? '',
        e.nekklachten ? 'ja' : 'nee',
        e.notitie,
      ]
        .map(csvEscape)
        .join(','),
    )
  return [headers.join(','), ...rows].join('\n')
}

export function toJsonBackup(entries: DagEntry[]): string {
  return JSON.stringify(
    {
      versie: 1,
      geexporteerd: new Date().toISOString(),
      entries: entries.slice().sort((a, b) => a.datum.localeCompare(b.datum)),
    },
    null,
    2,
  )
}

export function downloadBlob(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/** Score 0-10 → CSS color (green → yellow → red) */
export function scoreColor(score: number): string {
  if (score <= 0) return '#94a3b8'
  if (score <= 3) return '#22c55e'
  if (score <= 5) return '#eab308'
  if (score <= 7) return '#f97316'
  return '#ef4444'
}
