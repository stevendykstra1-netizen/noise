interface FooterBarProps {
  onRefresh: () => void
  isRefreshing?: boolean
}

export function FooterBar({ onRefresh, isRefreshing }: FooterBarProps) {
  return (
    <footer className="mt-2 pb-2 flex flex-col items-center gap-3">
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="w-full py-3 rounded-xl bg-[#111d2e] border border-slate-700 text-sm font-medium text-slate-300 active:scale-95 transition-transform disabled:opacity-50"
      >
        {isRefreshing ? 'Refreshing…' : '↺ Refresh All'}
      </button>
      <p className="text-xs text-slate-600 text-center">
        Data: NOAA Weather API · NDBC Buoys · GLERL CoastWatch
      </p>
    </footer>
  )
}
