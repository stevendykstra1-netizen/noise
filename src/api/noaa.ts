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

export interface MarineZoneForecastResponse {
  properties: {
    updated: string
    periods: Array<{
      name: string
      detailedForecast: string
    }>
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

export function fetchMarineZoneForecast(zoneId: string) {
  return noaaFetch<MarineZoneForecastResponse>(
    `https://api.weather.gov/zones/forecast/${zoneId}/forecast`
  )
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

export async function fetchLatestAfd(officeId: string): Promise<AfdProductResponse> {
  const list = await noaaFetch<AfdListResponse>(
    `https://api.weather.gov/products/types/AFD/locations/${officeId}`
  )
  const latest = list['@graph']?.[0]
  if (!latest) throw new Error('No AFD products found')
  return noaaFetch<AfdProductResponse>(latest['@id'])
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Extract zone ID from a forecastZone URL like .../zones/forecast/ILZ011 */
export function zoneIdFromUrl(url: string): string {
  return url.split('/').pop() ?? ''
}
