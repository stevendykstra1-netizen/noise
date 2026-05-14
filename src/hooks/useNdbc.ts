import { useQueries } from '@tanstack/react-query'
import { fetchBuoy, hasUsableData, BUOY_STATIONS } from '../api/ndbc'
import type { BuoyObservation } from '../components/CurrentConditionsCard'

const STALE_MS = 10 * 60 * 1000 // 10 min — buoys update hourly

export interface BuoyResult {
  /** Best available observation (first station in priority order with usable data) */
  observation: BuoyObservation | null
  /** True while the primary station is still loading */
  loading: boolean
  /** True if every station errored or returned unusable data */
  allFailed: boolean
  /** True if we fell back from the primary station */
  usingFallback: boolean
  /** Refetch function for manual refresh */
  refetch: () => void
}

export function useBuoyObservation(): BuoyResult {
  const results = useQueries({
    queries: BUOY_STATIONS.map((station) => ({
      queryKey: ['ndbc', station.id],
      queryFn: () => fetchBuoy(station.id, station.label),
      staleTime: STALE_MS,
      gcTime: 2 * 60 * 60 * 1000,
      retry: 1,
      // Don't retry with backoff — buoy is either up or it isn't
      retryDelay: 2000,
    })),
  })

  // Walk stations in priority order; pick the first with usable data
  let observation: BuoyObservation | null = null
  let usingFallback = false

  for (let i = 0; i < BUOY_STATIONS.length; i++) {
    const r = results[i]
    if (r.data && hasUsableData(r.data)) {
      observation = r.data
      usingFallback = i > 0
      break
    }
  }

  // Loading = primary station is still in flight and we have nothing yet
  const primaryLoading = results[0].isLoading
  const loading = primaryLoading && observation === null

  // All failed = every query settled with no usable data
  const allSettled = results.every((r) => !r.isLoading && !r.isFetching)
  const allFailed = allSettled && observation === null

  function refetch() {
    results.forEach((r) => r.refetch())
  }

  return { observation, loading, allFailed, usingFallback, refetch }
}
