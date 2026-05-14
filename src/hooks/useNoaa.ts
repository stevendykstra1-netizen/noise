import { useQuery } from '@tanstack/react-query'
import {
  fetchPoints,
  fetchMarineZoneForecast,
  fetchAlerts,
  fetchForecast,
  fetchHourly,
  fetchLatestAfd,
  zoneIdFromUrl,
} from '../api/noaa'
import { MARINE_ZONE, WICKER_PARK_COORDS } from '../config'
import type { BuoyObservation } from '../components/CurrentConditionsCard'
import type { MarinePeriod } from '../components/MarineZoneForecastCard'
import type { ForecastPeriod, HourlyPeriod } from '../components/LandForecastCard'

const { lat, lon } = WICKER_PARK_COORDS

// ── Points (cache nearly forever — grid only changes if NWS re-grids) ─────────

export function usePoints() {
  return useQuery({
    queryKey: ['noaa', 'points', lat, lon],
    queryFn: () => fetchPoints(lat, lon),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
  })
}

// ── Marine zone forecast ──────────────────────────────────────────────────────

export function useMarineZoneForecast() {
  return useQuery({
    queryKey: ['noaa', 'marineZone', MARINE_ZONE],
    queryFn: () => fetchMarineZoneForecast(MARINE_ZONE),
    staleTime: 30 * 60 * 1000,
    select: (data) => ({
      periods: data.properties.periods as MarinePeriod[],
      updatedAt: new Date(data.properties.updated),
    }),
  })
}

// ── Alerts (marine zone + land zone from points) ──────────────────────────────

export function useAlerts() {
  const points = usePoints()

  const landZoneId = points.data
    ? zoneIdFromUrl(points.data.properties.forecastZone)
    : null

  return useQuery({
    queryKey: ['noaa', 'alerts', MARINE_ZONE, landZoneId],
    queryFn: () => fetchAlerts([MARINE_ZONE, ...(landZoneId ? [landZoneId] : [])]),
    enabled: !points.isLoading,
    staleTime: 5 * 60 * 1000,
    select: (data) =>
      data.features
        .filter((f) => f.properties.status === 'Actual')
        .map((f) => ({
          id: f.id,
          event: f.properties.event,
          headline: f.properties.headline,
          severity: f.properties.severity,
        })),
  })
}

// ── Land 7-day forecast ───────────────────────────────────────────────────────

export function useLandForecast() {
  const points = usePoints()
  const forecastUrl = points.data?.properties.forecast

  return useQuery({
    queryKey: ['noaa', 'forecast', forecastUrl],
    queryFn: () => fetchForecast(forecastUrl!),
    enabled: !!forecastUrl,
    staleTime: 30 * 60 * 1000,
    select: (data) => ({
      periods: data.properties.periods.slice(0, 5).map(
        (p): ForecastPeriod => ({
          name: p.name,
          temperature: p.temperature,
          temperatureUnit: p.temperatureUnit,
          windSpeed: p.windSpeed,
          windDirection: p.windDirection,
          shortForecast: p.shortForecast,
          detailedForecast: p.detailedForecast,
          isDaytime: p.isDaytime,
        })
      ),
      updatedAt: new Date(data.properties.updated),
    }),
  })
}

// ── Land hourly forecast ──────────────────────────────────────────────────────

export function useLandHourly() {
  const points = usePoints()
  const hourlyUrl = points.data?.properties.forecastHourly

  return useQuery({
    queryKey: ['noaa', 'hourly', hourlyUrl],
    queryFn: () => fetchHourly(hourlyUrl!),
    enabled: !!hourlyUrl,
    staleTime: 30 * 60 * 1000,
    select: (data) =>
      data.properties.periods.slice(0, 12).map(
        (p): HourlyPeriod => ({
          startTime: p.startTime,
          temperature: p.temperature,
          temperatureUnit: p.temperatureUnit,
          windSpeed: p.windSpeed,
          probabilityOfPrecipitation: p.probabilityOfPrecipitation ?? { value: null },
          shortForecast: p.shortForecast,
        })
      ),
  })
}

// ── Forecast discussion (AFD) ─────────────────────────────────────────────────

export function useAfd() {
  return useQuery({
    queryKey: ['noaa', 'afd', 'LOT'],
    queryFn: () => fetchLatestAfd('LOT'),
    staleTime: 60 * 60 * 1000,
    select: (data) => ({
      text: data.productText,
      issuedAt: new Date(data.issuanceTime),
    }),
  })
}

// ── Convenience: pull water temp from buoy obs (passed in) ───────────────────

export function extractWaterTempF(obs: BuoyObservation | null): number | null {
  return obs?.waterTempF ?? null
}
