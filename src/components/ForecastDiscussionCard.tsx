import { useState } from 'react'
import { Card, CardHeader, UpdatedBadge, StaleBadge, ErrorState } from './Card'

interface ForecastDiscussionCardProps {
  text: string | null
  issuedAt: Date | null
  loading?: boolean
  error?: boolean
  stale?: boolean
  onRetry?: () => void
}

function updatedText(d: Date | null): string {
  if (!d) return ''
  const mins = Math.round((Date.now() - d.getTime()) / 60000)
  if (mins < 60) return `${mins}m ago`
  const h = Math.round(mins / 60)
  return `${h}h ago`
}

export function ForecastDiscussionCard({
  text,
  issuedAt,
  loading,
  error,
  stale,
  onRetry,
}: ForecastDiscussionCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card>
      <CardHeader
        title="Forecast Discussion · LOT"
        badge={
          stale ? <StaleBadge /> : issuedAt ? <UpdatedBadge text={updatedText(issuedAt)} /> : undefined
        }
      />

      <button
        onClick={() => setExpanded((v) => !v)}
        className="text-xs text-blue-400 underline underline-offset-2 mb-2"
      >
        {expanded ? 'Collapse' : 'Expand'} AFD
      </button>

      {expanded && (
        <>
          {loading && (
            <div className="space-y-2 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-3 bg-slate-800 rounded" />
              ))}
            </div>
          )}
          {error && !text && (
            <ErrorState message="Couldn't load forecast discussion" onRetry={onRetry} />
          )}
          {text && (
            <pre className="text-xs text-slate-400 font-mono leading-relaxed overflow-x-auto">
              {text}
            </pre>
          )}
        </>
      )}
    </Card>
  )
}
