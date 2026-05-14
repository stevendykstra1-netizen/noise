import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query'
import { AlertsBanner } from './components/AlertsBanner'
import { CurrentConditionsCard } from './components/CurrentConditionsCard'
import { MarineZoneForecastCard } from './components/MarineZoneForecastCard'
import { LandForecastCard } from './components/LandForecastCard'
import { ForecastDiscussionCard } from './components/ForecastDiscussionCard'
import { WaterTempCard } from './components/WaterTempCard'
import { FooterBar } from './components/FooterBar'
import {
  useAlerts,
  useMarineZoneForecast,
  useLandForecast,
  useLandHourly,
  useAfd,
} from './hooks/useNoaa'
import { useBuoyObservation } from './hooks/useNdbc'

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

function MarineApp() {
  const qc = useQueryClient()

  const alerts = useAlerts()
  const marine = useMarineZoneForecast()
  const forecast = useLandForecast()
  const hourly = useLandHourly()
  const afd = useAfd()
  const buoy = useBuoyObservation()

  const isRefreshing =
    alerts.isFetching ||
    marine.isFetching ||
    forecast.isFetching ||
    hourly.isFetching ||
    afd.isFetching

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
        <AlertsBanner
          alerts={alerts.data ?? []}
          loading={alerts.isLoading}
        />

        {/* 2. Current conditions */}
        <CurrentConditionsCard
          observation={buoy.observation}
          loading={buoy.loading}
          error={buoy.allFailed}
          usingFallback={buoy.usingFallback}
          onRetry={buoy.refetch}
        />

        {/* 3. Marine zone forecast */}
        <MarineZoneForecastCard
          periods={marine.data?.periods ?? []}
          updatedAt={marine.data?.updatedAt ?? null}
          loading={marine.isLoading}
          error={marine.isError}
          stale={marine.isError && !!marine.data}
          onRetry={() => qc.invalidateQueries({ queryKey: ['noaa', 'marineZone'] })}
        />

        {/* 4. Land forecast */}
        <LandForecastCard
          periods={forecast.data?.periods ?? []}
          hourly={hourly.data ?? []}
          updatedAt={forecast.data?.updatedAt ?? null}
          loading={forecast.isLoading}
          error={forecast.isError}
          stale={forecast.isError && !!forecast.data}
          onRetry={() => qc.invalidateQueries({ queryKey: ['noaa', 'forecast'] })}
        />

        {/* 5. Forecast discussion */}
        <ForecastDiscussionCard
          text={afd.data?.text ?? null}
          issuedAt={afd.data?.issuedAt ?? null}
          loading={afd.isLoading}
          error={afd.isError}
          stale={afd.isError && !!afd.data}
          onRetry={() => qc.invalidateQueries({ queryKey: ['noaa', 'afd'] })}
        />

        {/* 6. Water temp */}
        <WaterTempCard buoyWaterTempF={buoy.observation?.waterTempF ?? null} />

        {/* Footer */}
        <FooterBar onRefresh={handleRefresh} isRefreshing={isRefreshing} />
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
