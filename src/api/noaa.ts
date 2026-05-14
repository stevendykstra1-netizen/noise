import { NOAA_USER_AGENT } from '../config'

const NOAA_HEADERS = {
  'User-Agent': NOAA_USER_AGENT,
  Accept: 'application/geo+json',
}

async function noaaFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: NOAA_HEADERS })
  if (!res.ok) throw new Error(`NOAA ${res.status}: ${url}`)
  return res.json() as Promise<T>
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PointsResponse {
  properties: {
    forecast: string
    forecastHourly: string
    forecastZone: string
    county: string
    cwa: string
    gridId: string
    gridX: number
    gridY: number
  }
}


export interface AlertFeature {
  id: string
  properties: {
    event: string
    headline: string
    severity: string
    urgency: string
    status: string
    effective: string
    expires: string
    description: string
  }
}

export interface AlertsResponse {
  features: AlertFeature[]
}

export interface ForecastPeriodRaw {
  name: string
  temperature: number
  temperatureUnit: string
  windSpeed: string
  windDirection: string
  shortForecast: string
  detailedForecast: string
  isDaytime: boolean
  startTime: string
  probabilityOfPrecipitation: { value: number | null }
}

export interface ForecastResponse {
  properties: {
    updated: string
    periods: ForecastPeriodRaw[]
  }
}

export interface HourlyResponse {
  properties: {
    updated: string
    periods: ForecastPeriodRaw[]
  }
}

export interface AfdProductEntry {
  '@id': string
  productCode: string
  issuanceTime: string
}

export interface AfdListResponse {
  '@graph': AfdProductEntry[]
}

export interface AfdProductResponse {
  productText: string
  issuanceTime: string
}

// ── Fetchers ──────────────────────────────────────────────────────────────────

export function fetchPoints(lat: number, lon: number) {
  return noaaFetch<PointsResponse>(`https://api.weather.gov/points/${lat},${lon}`)
}

// Generic: fetch the latest product of any type from an NWS office
export async function fetchLatestProduct(
  productType: string,
  officeId: string
): Promise<AfdProductResponse> {
  const list = await noaaFetch<AfdListResponse>(
    `https://api.weather.gov/products/types/${productType}/locations/${officeId}`
  )
  const latest = list['@graph']?.[0]
  if (!latest) throw new Error(`No ${productType} products found for ${officeId}`)
  return noaaFetch<AfdProductResponse>(latest['@id'])
}

// Parse the LMZ741 (or any zone) section out of an NSH/CWF text product.
//
// NSH text structure:
//   LMZ741-141200-
//   WILMETTE HARBOR TO NORTHERLY ISLAND IL...
//   .TODAY...SW WINDS 10 TO 15 KT. WAVES 1 TO 2 FT.
//   .TONIGHT...S WINDS 15 TO 20 KT. WAVES 2 TO 3 FT.
//   $$
export function parseNshZoneSection(
  productText: string,
  zoneId: string
): Array<{ name: string; detailedForecast: string }> {
  const lines = productText.split('\n').map((l) => l.trim())

  const startIdx = lines.findIndex((l) => l.includes(zoneId))
  if (startIdx === -1) return []

  // Section ends at $$ or the next zone identifier (e.g. LMZ742-...)
  let endIdx = lines.length
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (lines[i] === '$$' || /^[A-Z]{2}Z\d{3}/.test(lines[i])) {
      endIdx = i
      break
    }
  }

  const section = lines.slice(startIdx, endIdx)
  const periods: Array<{ name: string; detailedForecast: string }> = []
  let name = ''
  let parts: string[] = []

  for (const line of section) {
    // .PERIOD...forecast text
    const m = line.match(/^\.([^.]+)\.\.\.(.*)/i)
    if (m) {
      if (name) periods.push({ name: toTitleCase(name), detailedForecast: parts.join(' ').trim() })
      name = m[1].trim()
      parts = m[2].trim() ? [m[2].trim()] : []
    } else if (name && line && !line.startsWith('.') && line !== '$$') {
      parts.push(line)
    }
  }
  if (name && parts.length > 0) {
    periods.push({ name: toTitleCase(name), detailedForecast: parts.join(' ').trim() })
  }

  return periods
}

function toTitleCase(s: string): string {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}

export function fetchAlerts(zones: string[]) {
  const zoneParam = zones.join(',')
  return noaaFetch<AlertsResponse>(
    `https://api.weather.gov/alerts/active?zone=${zoneParam}`
  )
}

export function fetchForecast(url: string) {
  return noaaFetch<ForecastResponse>(url)
}

export function fetchHourly(url: string) {
  return noaaFetch<HourlyResponse>(url)
}

export function fetchLatestAfd(officeId: string): Promise<AfdProductResponse> {
  return fetchLatestProduct('AFD', officeId)
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Extract zone ID from a forecastZone URL like .../zones/forecast/ILZ011 */
export function zoneIdFromUrl(url: string): string {
  return url.split('/').pop() ?? ''
}
