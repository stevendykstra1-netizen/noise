import { Card, CardHeader, UpdatedBadge, StaleBadge, ErrorState } from './Card'
import { WIND_THRESHOLDS, WAVE_THRESHOLDS } from '../config'

export interface BuoyObservation {
  stationId: string
  stationLabel: string
  windDirDeg: number | null
  windDirCardinal: string | null
  windSpeedKt: number | null
  windGustKt: number | null
  waveHeightFt: number | null
  wavePeriodSec: number | null
  waterTempF: number | null
  airTempF: number | null
  observedAt: Date | null
}

interface CurrentConditionsCardProps {
  observation: BuoyObservation | null
  loading?: boolean
  error?: boolean
  stale?: boolean
  onRetry?: () => void
}

function windColor(kt: number | null): string {
  if (kt === null) return 'text-slate-400'
  if (kt < WIND_THRESHOLDS.calm) return 'text-emerald-400'
  if (kt < WIND_THRESHOLDS.moderate) return 'text-amber-400'
  return 'text-red-400'
}

function waveColor(ft: number | null): string {
  if (ft === null) return 'text-slate-400'
  if (ft < WAVE_THRESHOLDS.calm) return 'text-emerald-400'
  if (ft < WAVE_THRESHOLDS.moderate) return 'text-amber-400'
  return 'text-red-400'
}

function updatedText(obs: BuoyObservation | null): string {
  if (!obs?.observedAt) return ''
  const mins = Math.round((Date.now() - obs.observedAt.getTime()) / 60000)
  if (mins < 2) return 'just now'
  return `${mins}m ago`
}

export function CurrentConditionsCard({
  observation,
  loading,
  error,
  stale,
  onRetry,
}: CurrentConditionsCardProps) {
  return (
    <Card>
      <CardHeader
        title={observation ? `Right Now · ${observation.stationLabel}` : 'Right Now'}
        badge={
          stale ? (
            <StaleBadge />
          ) : observation ? (
            <UpdatedBadge text={updatedText(observation)} />
          ) : undefined
        }
      />

      {loading && (
        <div className="space-y-3 animate-pulse">
          <div className="h-10 bg-slate-800 rounded w-32" />
          <div className="h-6 bg-slate-800 rounded w-24" />
        </div>
      )}

      {error && !observation && (
        <ErrorState message="Couldn't load buoy data" onRetry={onRetry} />
      )}

      {observation && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Wind</p>
            <p className={`text-3xl font-bold tabular-nums ${windColor(observation.windSpeedKt)}`}>
              {observation.windSpeedKt !== null ? Math.round(observation.windSpeedKt) : '—'}
              <span className="text-lg font-normal"> kt</span>
            </p>
            {observation.windGustKt !== null && (
              <p className={`text-sm ${windColor(observation.windGustKt)}`}>
                gust {Math.round(observation.windGustKt)} kt
              </p>
            )}
            {observation.windDirCardinal && (
              <p className="text-sm text-slate-400">from {observation.windDirCardinal}</p>
            )}
          </div>

          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Waves</p>
            <p className={`text-3xl font-bold tabular-nums ${waveColor(observation.waveHeightFt)}`}>
              {observation.waveHeightFt !== null ? observation.waveHeightFt.toFixed(1) : '—'}
              <span className="text-lg font-normal"> ft</span>
            </p>
            {observation.wavePeriodSec !== null && (
              <p className="text-sm text-slate-400">{observation.wavePeriodSec}s period</p>
            )}
          </div>

          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Water Temp</p>
            <p className="text-xl font-semibold text-cyan-400">
              {observation.waterTempF !== null ? `${Math.round(observation.waterTempF)}°F` : '—'}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Air Temp</p>
            <p className="text-xl font-semibold text-slate-300">
              {observation.airTempF !== null ? `${Math.round(observation.airTempF)}°F` : '—'}
            </p>
          </div>
        </div>
      )}

    </Card>
  )
}
