import { Card, CardHeader, UpdatedBadge, StaleBadge, ErrorState } from './Card'

export interface MarinePeriod {
  name: string
  detailedForecast: string
}

interface MarineZoneForecastCardProps {
  periods: MarinePeriod[]
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

export function MarineZoneForecastCard({
  periods,
  updatedAt,
  loading,
  error,
  stale,
  onRetry,
}: MarineZoneForecastCardProps) {
  return (
    <Card>
      <CardHeader
        title="Marine Zone · LMZ741"
        badge={
          stale ? <StaleBadge /> : updatedAt ? <UpdatedBadge text={updatedText(updatedAt)} /> : undefined
        }
      />

      {loading && (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1">
              <div className="h-4 bg-slate-800 rounded w-24" />
              <div className="h-3 bg-slate-800 rounded w-full" />
              <div className="h-3 bg-slate-800 rounded w-4/5" />
            </div>
          ))}
        </div>
      )}

      {error && !periods.length && (
        <ErrorState message="Couldn't load marine zone forecast" onRetry={onRetry} />
      )}

      {periods.length > 0 && (
        <div className="divide-y divide-slate-800">
          {periods.map((period) => (
            <div key={period.name} className="py-3 first:pt-0 last:pb-0">
              <p className="text-sm font-semibold text-slate-300 mb-1">{period.name}</p>
              <p className="text-sm text-slate-400 leading-relaxed">{period.detailedForecast}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
