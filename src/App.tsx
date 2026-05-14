import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query'
import { AlertsBanner } from './components/AlertsBanner'
import { CurrentConditionsCard, type BuoyObservation } from './components/CurrentConditionsCard'
import { MarineZoneForecastCard, type MarinePeriod } from './components/MarineZoneForecastCard'
import { LandForecastCard, type ForecastPeriod, type HourlyPeriod } from './components/LandForecastCard'
import { ForecastDiscussionCard } from './components/ForecastDiscussionCard'
import { WaterTempCard } from './components/WaterTempCard'
import { FooterBar } from './components/FooterBar'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
      refetchOnWindowFocus: true,
      retry: 2,
    },
  },
})

// ── Placeholder data for Step 1 ───────────────────────────────────────────────

const PLACEHOLDER_OBS: BuoyObservation = {
  stationId: 'CHII2',
  stationLabel: 'Chicago Crib',
  windDirDeg: 225,
  windDirCardinal: 'SW',
  windSpeedKt: 12,
  windGustKt: 17,
  waveHeightFt: 2.3,
  wavePeriodSec: 5,
  waterTempF: 58,
  airTempF: 64,
  observedAt: new Date(Date.now() - 18 * 60000),
}

const PLACEHOLDER_MARINE: MarinePeriod[] = [
  {
    name: 'Today',
    detailedForecast:
      'South winds 10 to 15 kt, becoming southwest 15 to 20 kt this afternoon. Waves 2 to 3 ft. Slight chance of showers.',
  },
  {
    name: 'Tonight',
    detailedForecast:
      'Southwest winds 15 to 20 kt. Waves 3 to 4 ft. Chance of thunderstorms. Small craft should exercise caution.',
  },
  {
    name: 'Friday',
    detailedForecast:
      'North winds 10 to 15 kt. Waves 2 to 3 ft, subsiding to 1 to 2 ft in the afternoon.',
  },
]

const PLACEHOLDER_PERIODS: ForecastPeriod[] = [
  {
    name: 'Today',
    temperature: 67,
    temperatureUnit: 'F',
    windSpeed: '10 to 15 mph',
    windDirection: 'SW',
    shortForecast: 'Partly Cloudy',
    detailedForecast: 'Partly cloudy with a slight chance of showers.',
    isDaytime: true,
  },
  {
    name: 'Tonight',
    temperature: 54,
    temperatureUnit: 'F',
    windSpeed: '15 to 20 mph',
    windDirection: 'W',
    shortForecast: 'Chance Thunderstorms',
    detailedForecast: 'Chance of thunderstorms after midnight.',
    isDaytime: false,
  },
  {
    name: 'Friday',
    temperature: 62,
    temperatureUnit: 'F',
    windSpeed: '10 mph',
    windDirection: 'N',
    shortForecast: 'Mostly Sunny',
    detailedForecast: 'Mostly sunny and pleasant.',
    isDaytime: true,
  },
  {
    name: 'Friday Night',
    temperature: 51,
    temperatureUnit: 'F',
    windSpeed: '5 mph',
    windDirection: 'N',
    shortForecast: 'Clear',
    detailedForecast: 'Clear and calm.',
    isDaytime: false,
  },
  {
    name: 'Saturday',
    temperature: 70,
    temperatureUnit: 'F',
    windSpeed: '5 to 10 mph',
    windDirection: 'S',
    shortForecast: 'Sunny',
    detailedForecast: 'Sunny and warm. Great boating day.',
    isDaytime: true,
  },
]

const PLACEHOLDER_HOURLY: HourlyPeriod[] = Array.from({ length: 12 }, (_, i) => {
  const d = new Date()
  d.setMinutes(0, 0, 0)
  d.setHours(d.getHours() + i + 1)
  return {
    startTime: d.toISOString(),
    temperature: 62 + Math.round(Math.sin(i / 3) * 6),
    temperatureUnit: 'F',
    windSpeed: '12 mph',
    probabilityOfPrecipitation: { value: i < 4 ? 20 : 0 },
    shortForecast: 'Partly Cloudy',
  }
})

// ──────────────────────────────────────────────────────────────────────────────

function MarineApp() {
  const qc = useQueryClient()

  function handleRefresh() {
    qc.invalidateQueries()
  }

  return (
    <div className="min-h-screen bg-navy-950 text-slate-200">
      <div className="max-w-lg mx-auto px-4 safe-top safe-bottom pb-6 space-y-3">
        {/* Header */}
        <header className="pt-1 pb-1 flex items-center justify-between">
          <h1 className="text-base font-semibold tracking-wide text-slate-300">⚓ Chicago Marine</h1>
          <span className="text-xs text-slate-500">Belmont Harbor</span>
        </header>

        {/* 1. Alerts */}
        <AlertsBanner alerts={[]} />

        {/* 2. Current conditions */}
        <CurrentConditionsCard observation={PLACEHOLDER_OBS} />

        {/* 3. Marine zone forecast */}
        <MarineZoneForecastCard
          periods={PLACEHOLDER_MARINE}
          updatedAt={new Date(Date.now() - 45 * 60000)}
        />

        {/* 4. Land forecast */}
        <LandForecastCard
          periods={PLACEHOLDER_PERIODS}
          hourly={PLACEHOLDER_HOURLY}
          updatedAt={new Date(Date.now() - 30 * 60000)}
        />

        {/* 5. Forecast discussion */}
        <ForecastDiscussionCard
          text="...AREA FORECAST DISCUSSION...\n\nThis is placeholder AFD text. Wire up the real NOAA AFD endpoint in Step 4 to see the actual NWS meteorologist's reasoning here.\n\n.SHORT TERM...\nSouthwest flow aloft will keep lake breezes suppressed through the afternoon. A cold front approaches tonight bringing thunderstorm risk. Main concern is wind gusts 25-35kt ahead of the front passage.\n\n.MARINE...\nSmall craft exercise caution tonight through Friday morning as seas build to 4-5ft ahead of frontal passage."
          issuedAt={new Date(Date.now() - 3 * 3600000)}
        />

        {/* 6. Water temp */}
        <WaterTempCard buoyWaterTempF={PLACEHOLDER_OBS.waterTempF} />

        {/* Footer */}
        <FooterBar onRefresh={handleRefresh} />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MarineApp />
    </QueryClientProvider>
  )
}
