import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-[#111d2e] rounded-2xl p-4 ${className}`}>
      {children}
    </div>
  )
}

interface CardHeaderProps {
  title: string
  badge?: ReactNode
}

export function CardHeader({ title, badge }: CardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">{title}</h2>
      {badge}
    </div>
  )
}

export function UpdatedBadge({ text }: { text: string }) {
  return (
    <span className="text-xs text-slate-500">{text}</span>
  )
}

export function StaleBadge() {
  return (
    <span className="text-xs bg-amber-900/40 text-amber-400 px-2 py-0.5 rounded-full">
      stale
    </span>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 py-4 text-center">
      <span className="text-slate-500 text-sm">{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs text-blue-400 underline underline-offset-2"
        >
          Retry
        </button>
      )}
    </div>
  )
}
