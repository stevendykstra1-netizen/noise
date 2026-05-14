import type { BuoyObservation } from '../components/CurrentConditionsCard'
import { NDBC_PROXY, BUOY_STATIONS } from '../config'

// ── Unit conversions ──────────────────────────────────────────────────────────

const msToKnots = (ms: number) => ms * 1.94384
const mToFt = (m: number) => m * 3.28084
const cToF = (c: number) => c * 1.8 + 32

function degreesToCardinal(deg: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  return dirs[Math.round(deg / 22.5) % 16]
}

// ── NDBC fixed-width text parser ──────────────────────────────────────────────
//
// Format (latest_obs/{STATION}.txt):
//   Line 0: column headers, prefixed with "#"  e.g. "#YY  MM DD hh mm WDIR ..."
//   Line 1: units, prefixed with "#"            e.g. "#yr  mo dy hr mn degT ..."
//   Line 2+: space-separated data rows; missing values are "MM"

type RawFields = {
  windDirDeg: number | null
  windSpeedMs: number | null
  gustMs: number | null
  wvhtM: number | null
  dpdSec: number | null
  wtmpC: number | null
  atmpC: number | null
  yr: string | null
  mo: string | null
  dy: string | null
  hr: string | null
  mn: string | null
}

function parseText(text: string): RawFields | null {
  const lines = text.trim().split('\n')

  const headerIdx = lines.findIndex((l) => l.startsWith('#YY') || l.startsWith('# YY'))
  if (headerIdx === -1) return null

  const headers = lines[headerIdx]
    .replace(/^#\s*/, '')
    .trim()
    .split(/\s+/)

  // First non-comment line after the two header lines is the latest observation
  const dataLine = lines.slice(headerIdx + 2).find((l) => !l.startsWith('#') && l.trim())
  if (!dataLine) return null

  const values = dataLine.trim().split(/\s+/)

  function idx(name: string): number {
    // The header stripped "#", so "YY" maps to index 0
    const i = headers.indexOf(name)
    return i
  }

  function numAt(name: string): number | null {
    const i = idx(name)
    if (i === -1) return null
    const v = values[i]
    if (!v || v === 'MM' || v === 'N/A') return null
    const n = parseFloat(v)
    return isNaN(n) ? null : n
  }

  function strAt(name: string): string | null {
    const i = idx(name)
    if (i === -1) return null
    const v = values[i]
    return !v || v === 'MM' ? null : v
  }

  return {
    yr: strAt('YY'),
    mo: strAt('MM'),
    dy: strAt('DD'),
    hr: strAt('hh'),
    mn: strAt('mm'),
    windDirDeg: numAt('WDIR'),
    windSpeedMs: numAt('WSPD'),
    gustMs: numAt('GST'),
    wvhtM: numAt('WVHT'),
    dpdSec: numAt('DPD'),
    wtmpC: numAt('WTMP'),
    atmpC: numAt('ATMP'),
  }
}

export async function fetchBuoy(
  stationId: string,
  stationLabel: string
): Promise<BuoyObservation> {
  const res = await fetch(NDBC_PROXY(stationId))
  if (!res.ok) throw new Error(`NDBC ${res.status}: ${stationId}`)

  const text = await res.text()
  const raw = parseText(text)
  if (!raw) throw new Error(`NDBC parse failed: ${stationId}`)

  let observedAt: Date | null = null
  if (raw.yr && raw.mo && raw.dy && raw.hr && raw.mn) {
    const yr = raw.yr.length === 2 ? `20${raw.yr}` : raw.yr
    observedAt = new Date(
      `${yr}-${raw.mo.padStart(2, '0')}-${raw.dy.padStart(2, '0')}T${raw.hr.padStart(2, '0')}:${raw.mn.padStart(2, '0')}:00Z`
    )
  }

  return {
    stationId,
    stationLabel,
    windDirDeg: raw.windDirDeg,
    windDirCardinal: raw.windDirDeg !== null ? degreesToCardinal(raw.windDirDeg) : null,
    windSpeedKt: raw.windSpeedMs !== null ? msToKnots(raw.windSpeedMs) : null,
    windGustKt: raw.gustMs !== null ? msToKnots(raw.gustMs) : null,
    waveHeightFt: raw.wvhtM !== null ? mToFt(raw.wvhtM) : null,
    wavePeriodSec: raw.dpdSec !== null ? Math.round(raw.dpdSec) : null,
    waterTempF: raw.wtmpC !== null ? cToF(raw.wtmpC) : null,
    airTempF: raw.atmpC !== null ? cToF(raw.atmpC) : null,
    observedAt,
  }
}

/** Returns true if the observation has at least wind or wave data (not all MM). */
export function hasUsableData(obs: BuoyObservation): boolean {
  return obs.windSpeedKt !== null || obs.waveHeightFt !== null
}

export { BUOY_STATIONS }
