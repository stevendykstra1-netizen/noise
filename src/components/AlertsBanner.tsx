interface Alert {
  id: string
  event: string
  headline: string
  severity: string
}

interface AlertsBannerProps {
  alerts: Alert[]
  loading?: boolean
}

function alertColor(alerts: Alert[]): string {
  if (alerts.length === 0) return 'bg-emerald-950 border-emerald-800'
  const hasWarning = alerts.some(
    (a) => a.severity === 'Extreme' || a.severity === 'Severe' || a.event.toLowerCase().includes('warning')
  )
  return hasWarning ? 'bg-red-950 border-red-700' : 'bg-amber-950 border-amber-700'
}

function alertTextColor(alerts: Alert[]): string {
  if (alerts.length === 0) return 'text-emerald-400'
  const hasWarning = alerts.some(
    (a) => a.severity === 'Extreme' || a.severity === 'Severe' || a.event.toLowerCase().includes('warning')
  )
  return hasWarning ? 'text-red-300' : 'text-amber-300'
}

export function AlertsBanner({ alerts, loading }: AlertsBannerProps) {
  if (loading) {
    return (
      <div className="w-full border rounded-xl px-4 py-3 mb-3 bg-slate-900 border-slate-700 animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-48" />
      </div>
    )
  }

  if (alerts.length === 0) {
    return (
      <div className={`w-full border rounded-xl px-4 py-3 mb-3 ${alertColor(alerts)}`}>
        <p className={`text-sm font-medium ${alertTextColor(alerts)}`}>
          ✓ No active marine advisories for LMZ741
        </p>
      </div>
    )
  }

  return (
    <div className={`w-full border rounded-xl px-4 py-3 mb-3 ${alertColor(alerts)}`}>
      {alerts.map((alert) => (
        <div key={alert.id} className="mb-1 last:mb-0">
          <p className={`text-sm font-bold uppercase tracking-wide ${alertTextColor(alerts)}`}>
            ⚠ {alert.event}
          </p>
          <p className={`text-xs mt-0.5 ${alertTextColor(alerts)} opacity-80`}>{alert.headline}</p>
        </div>
      ))}
    </div>
  )
}
