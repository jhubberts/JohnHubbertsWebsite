/**
 * Which chapters of a series this reader has finished, remembered in this browser only.
 *
 * Stored under one key as a JSON object from series slug to a list of chapter numbers. Nothing
 * here throws: storage that is missing, blocked or holds something unexpected counts as "nothing
 * read".
 */

import { RENUMBERING_2026_11_23, RENUMBERING_2026_11_24 } from './ai-series/old-addresses'
import { browserStorage, type ReadStorage } from './browser-storage'

export const SERIES_PROGRESS_KEY = 'series-progress.v3'

/**
 * Where progress was kept before the AI series was renumbered on 2026-11-23. Its chapter numbers
 * are the old ones.
 */
export const SERIES_PROGRESS_V1_KEY = 'series-progress.v1'

/**
 * Where progress was kept between the renumberings of 2026-11-23 and 2026-11-24. Its chapter
 * numbers are the ones of that time.
 */
export const SERIES_PROGRESS_V2_KEY = 'series-progress.v2'

/** The one series that was renumbered. Other series are kept as they are. */
const RENUMBERED_SERIES = 'how-ai-works'

type ChapterMap = Record<number, number>

function hasEntry(numbers: ChapterMap, part: number): boolean {
  return Object.prototype.hasOwnProperty.call(numbers, part)
}

/** `first` followed by `then`. A number that `first` maps to a number `then` lacks is dropped. */
function chain(first: ChapterMap, then: ChapterMap): ChapterMap {
  return Object.fromEntries(
    Object.entries(first)
      .filter(([, middle]) => hasEntry(then, middle))
      .map(([part, middle]) => [part, then[middle]]),
  )
}

/**
 * The keys that held progress before SERIES_PROGRESS_KEY, newest first, each with the renumbered
 * series' chapter numbers of its time mapped to today's numbers.
 */
const EARLIER_KEYS: { key: string; currentNumber: ChapterMap }[] = [
  { key: SERIES_PROGRESS_V2_KEY, currentNumber: RENUMBERING_2026_11_24 },
  {
    key: SERIES_PROGRESS_V1_KEY,
    currentNumber: chain(RENUMBERING_2026_11_23, RENUMBERING_2026_11_24),
  },
]

type ReadWriteStorage = Pick<Storage, 'getItem' | 'setItem'>

/** Parses the stored text into an object from series slug to its chapter list; {} if unusable. */
function parseStore(raw: string | null): Record<string, unknown> {
  if (!raw) return {}
  try {
    const value: unknown = JSON.parse(raw)
    return value !== null && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {}
  } catch {
    return {}
  }
}

/** Ascending chapter numbers without duplicates; [] unless every item is a non-negative integer. */
function cleanParts(value: unknown): number[] {
  if (!Array.isArray(value)) return []
  if (!value.every((n) => Number.isInteger(n) && n >= 0)) return []
  return [...new Set<number>(value)].sort((a, b) => a - b)
}

/** The chapters of a series in the stored text. */
export function partsInStored(raw: string | null, seriesSlug: string): number[] {
  return cleanParts(parseStore(raw)[seriesSlug])
}

/**
 * The stored text with the renumbered series' chapters given today's numbers. A chapter number
 * missing from `currentNumber` is dropped.
 */
function migrate(raw: string, currentNumber: ChapterMap): string {
  const store = parseStore(raw)
  if (RENUMBERED_SERIES in store) {
    store[RENUMBERED_SERIES] = cleanParts(store[RENUMBERED_SERIES])
      .filter((part) => hasEntry(currentNumber, part))
      .map((part) => currentNumber[part])
      .sort((a, b) => a - b)
  }
  return JSON.stringify(store)
}

/**
 * The stored text, or null when nothing is stored or storage cannot be read. Never throws.
 *
 * When only earlier keys hold progress, the text under the newest of them is renumbered and, where
 * the storage can be written, saved under the current key, which from then on is read instead.
 * The earlier keys are never changed, so progress is renumbered from the same old text every time
 * and never twice.
 */
export function rawStored(
  storage: (ReadStorage & Partial<Pick<Storage, 'setItem'>>) | null = browserStorage(),
): string | null {
  if (!storage) return null
  try {
    const current = storage.getItem(SERIES_PROGRESS_KEY)
    if (current !== null) return current
    for (const { key, currentNumber } of EARLIER_KEYS) {
      const old = storage.getItem(key)
      if (old === null) continue
      const migrated = migrate(old, currentNumber)
      try {
        storage.setItem?.(SERIES_PROGRESS_KEY, migrated)
      } catch {
        // Storage cannot be written. The next read renumbers the old text again.
      }
      return migrated
    }
    return null
  } catch {
    return null
  }
}

/** The chapter numbers recorded as read for a series, ascending, without duplicates. Never throws. */
export function readChapters(
  seriesSlug: string,
  storage: ReadStorage | null = browserStorage(),
): number[] {
  return partsInStored(rawStored(storage), seriesSlug)
}

/** Records a chapter as read. Never throws. */
export function markChapterRead(
  seriesSlug: string,
  part: number,
  storage: ReadWriteStorage | null = browserStorage(),
): void {
  const raw = rawStored(storage)
  const current = partsInStored(raw, seriesSlug)
  if (!Number.isInteger(part) || part < 0 || current.includes(part)) return
  try {
    // Entries for other series are kept as they are.
    const store = parseStore(raw)
    store[seriesSlug] = [...current, part].sort((a, b) => a - b)
    storage?.setItem(SERIES_PROGRESS_KEY, JSON.stringify(store))
  } catch {
    // Storage is unavailable or full. The chapter is not remembered.
  }
}

/** The lowest chapter in `parts` that is not in `read`, or undefined when all are read. */
export function firstUnread(parts: number[], read: Iterable<number>): number | undefined {
  const done = new Set(read)
  return [...parts].sort((a, b) => a - b).find((part) => !done.has(part))
}

/** One sentence for screen readers, describing a series' progress. */
export function describeProgress(
  parts: number[],
  read: ReadonlySet<number>,
  current?: number,
): string {
  const readList = parts.filter((part) => read.has(part))
  const sentences = [
    readList.length > 0 ? `Chapters read: ${readList.join(', ')}.` : 'No chapters read yet.',
  ]
  if (current !== undefined) sentences.push(`Open now: chapter ${current}.`)
  sentences.push(`${parts.length} chapters in all.`)
  return sentences.join(' ')
}
