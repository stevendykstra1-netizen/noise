import { Card, CardHeader, ErrorState } from './Card'
import { GLERL_WATER_TEMP_IMG } from '../config'

interface WaterTempCardProps {
  buoyWaterTempF: number | null
  loading?: boolean
  error?: boolean
  onRetry?: () => void
}

export function WaterTempCard({ buoyWaterTempF, loading, error, onRetry }: WaterTempCardProps) {
  return (
    <Card>
      <CardHeader title="Lake Michigan Water Temp" />

      {buoyWaterTempF !== null && (
        <p className="text-2xl font-bold text-cyan-400 mb-3">
          {Math.round(buoyWaterTempF)}°F
          <span className="text-sm font-normal text-slate-500 ml-2">at Chicago Crib</span>
        </p>
      )}

      {loading && (
        <div className="h-40 bg-slate-800 rounded-lg animate-pulse" />
      )}

      {error && !loading && (
        <ErrorState message="Couldn't load lake surface temp image" onRetry={onRetry} />
      )}

      {!loading && !error && (
        <img
          src={GLERL_WATER_TEMP_IMG}
          alt="Great Lakes surface water temperature"
          className="w-full rounded-lg"
          loading="lazy"
          onError={(e) => {
            ;(e.target as HTMLImageElement).style.display = 'none'
          }}
        />
      )}

      <p className="text-xs text-slate-600 mt-2">Source: GLERL CoastWatch</p>
    </Card>
  )
}
