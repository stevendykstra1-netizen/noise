export const NOAA_USER_AGENT = 'chicago-marine-pwa (contact: my-email@example.com)'

export const MARINE_ZONE = 'LMZ741'

export const WICKER_PARK_COORDS = { lat: 41.9088, lon: -87.6796 }

export const NOAA_API = {
  marineZoneForecast: `https://api.weather.gov/zones/forecast/${MARINE_ZONE}/forecast`,
  marineAlerts: `https://api.weather.gov/alerts/active?zone=${MARINE_ZONE}`,
  points: (lat: number, lon: number) => `https://api.weather.gov/points/${lat},${lon}`,
  afdProducts: 'https://api.weather.gov/products/types/AFD/locations/LOT',
}

export const BUOY_STATIONS = [
  { id: 'CHII2', label: 'Chicago Crib', primary: true },
  { id: '45198', label: 'Michigan City', primary: false },
  { id: '45174', label: 'Winthrop Harbor', primary: false },
  { id: '45007', label: 'S. Lake Michigan', primary: false },
] as const

export type BuoyStationId = (typeof BUOY_STATIONS)[number]['id']

export const NDBC_PROXY = (stationId: string) => `/ndbc/${stationId}.txt`

export const GLERL_WATER_TEMP_IMG =
  'https://coastwatch.glerl.noaa.gov/glsea/glsea.gif'

export const WIND_THRESHOLDS = { calm: 10, moderate: 20 }
export const WAVE_THRESHOLDS = { calm: 2, moderate: 4 }
