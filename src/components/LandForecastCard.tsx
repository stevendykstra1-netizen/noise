import { useState } from 'react'
import { Card, CardHeader, UpdatedBadge, StaleBadge, ErrorState } from './Card'

export interface ForecastPeriod {
  name: string
  temperature: number
  temperatureUnit: string
  windSpeed: string
  windDirection: string
  shortForecast: string
  detailedForecast: string
  isDaytime: boolean
}

export interface HourlyPeriod {
  startTime: string
  temperature: number
  temperatureUnit: string
  windSpeed: string
  probabilityOfPrecipitation: { value: number | null }
  shortForecast: string
}

interface LandForecastCardProps {
  periods: ForecastPeriod[]
  hourly: HourlyPeriod[]
  updatedAt: Date | null
  loading?: boolean
  error?: boolean
  stale?: boolean
  onRetry?: () => void
}

function updatedText(d: Date | null): string {
  if (!d) return ''
  const mins = Math.round((Date.now() - d.getTime()) / 60000)
  if (mins < 2) return 'just now'
  if (mins < 60) return `${mins}m ago`
  return `${Math.round(mins / 60)}h ago`
}

function hourLabel(isoString: string): string {
  const d = new Date(isoString)
  const h = d.getHours()
  if (h === 0) return '12a'
  if (h === 12) return '12p'
  return h > 12 ? `${h - 12}p` : `${h}a`
}

export function LandForecastCard({
  periods,
  hourly,
  updatedAt,
  loading,
  error,
  stale,
  onRetry,
}: LandForecastCardProps) {
  const [showHourly, setShowHourly] = useState(false)
  const displayPeriods = periods.slice(0, 5)
  const displayHourly = hourly.slice(0, 12)

  return (
    <Card>
      <CardHeader
        title="Wicker Park · Land Forecast"
        badge={
          stale ? <StaleBadge /> : updatedAt ? <UpdatedBadge text={updatedText(updatedAt)} /> : undefined
        }
      />

      {loading && (
        <div className="space-y-2 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-4 bg-slate-800 rounded w-20" />
              <div className="h-4 bg-slate-800 rounded flex-1" />
            </div>
          ))}
        </div>
      )}

      {error && !periods.length && (
        <ErrorState message="Couldn't load land forecast" onRetry={onRetry} />
      )}

      {displayPeriods.length > 0 && (
        <>
          <div className="divide-y divide-slate-800">
            {displayPeriods.map((period) => (
              <div key={period.name} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="w-20 shrink-0">
                  <p className="text-xs font-semibold text-slate-300">{period.name}</p>
                  <p className="text-lg font-bold text-slate-200">
                    {period.temperature}°{period.temperatureUnit}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400 leading-relaxed">{period.shortForecast}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Wind {period.windSpeed} {period.windDirection}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {displayHourly.length > 0 && (
            <div className="mt-3 border-t border-slate-800 pt-3">
              <button
                onClick={() => setShowHourly((v) => !v)}
                className="text-xs text-blue-400 underline underline-offset-2 mb-2"
              >
                {showHourly ? 'Hide' : 'Show'} 12-hour hourly
              </button>
              {showHourly && (
                <div className="overflow-x-auto">
                  <div className="flex gap-3 pb-1" style={{ minWidth: 'max-content' }}>
                    {displayHourly.map((h) => (
                      <div key={h.startTime} className="flex flex-col items-center gap-1 w-10">
                        <span className="text-xs text-slate-500">{hourLabel(h.startTime)}</span>
                        <span className="text-sm font-semibold text-slate-300">
                          {h.temperature}°
                        </span>
                        {h.probabilityOfPrecipitation.value !== null && (
                          <span className="text-xs text-blue-400">
                            {h.probabilityOfPrecipitation.value}%
                          </span>
                        )}
                        <span className="text-xs text-slate-500 text-center leading-none">
                          {h.windSpeed}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </Card>
  )
}
