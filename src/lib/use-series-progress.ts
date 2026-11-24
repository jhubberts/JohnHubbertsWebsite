import { useCallback, useSyncExternalStore } from 'react'
import { SERIES_PROGRESS_KEY, markChapterRead, partsInStored, rawStored } from './series-progress'

const EMPTY: ReadonlySet<number> = new Set()

// Components in this tab to tell when a chapter is recorded. The browser's `storage` event only
// reaches other tabs.
const listeners = new Set<() => void>()

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === SERIES_PROGRESS_KEY) listener()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

// The last set handed out for each series, with the stored text it was built from. While the
// stored text is unchanged the same set is returned, which keeps the snapshot stable for React.
const cache = new Map<string, { raw: string | null; set: ReadonlySet<number> }>()

function snapshot(seriesSlug: string): ReadonlySet<number> {
  const raw = rawStored()
  const hit = cache.get(seriesSlug)
  if (hit && hit.raw === raw) return hit.set
  const set: ReadonlySet<number> = new Set(partsInStored(raw, seriesSlug))
  cache.set(seriesSlug, { raw, set })
  return set
}

/** The chapters of a series read on this device, and a way to record one. Updates every component using it. */
export function useSeriesProgress(seriesSlug: string): {
  read: ReadonlySet<number>
  markRead: (part: number) => void
} {
  const read = useSyncExternalStore(
    subscribe,
    () => snapshot(seriesSlug),
    () => EMPTY,
  )
  const markRead = useCallback(
    (part: number) => {
      markChapterRead(seriesSlug, part)
      listeners.forEach((listener) => listener())
    },
    [seriesSlug],
  )
  return { read, markRead }
}
