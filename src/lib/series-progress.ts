/**
 * Which chapters of a series this reader has finished, remembered in this browser only.
 *
 * Stored under one key as a JSON object from series slug to a list of chapter numbers. Nothing
 * here throws: storage that is missing, blocked or holds something unexpected counts as "nothing
 * read".
 */

export const SERIES_PROGRESS_KEY = 'series-progress.v1'

export type ReadStorage = Pick<Storage, 'getItem'>
export type ReadWriteStorage = Pick<Storage, 'getItem' | 'setItem'>

export function browserStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

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

function rawStored(storage: ReadStorage | null): string | null {
  try {
    return storage?.getItem(SERIES_PROGRESS_KEY) ?? null
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

/** Records a chapter as read. Returns the series' read chapters afterwards. Never throws. */
export function markChapterRead(
  seriesSlug: string,
  part: number,
  storage: ReadWriteStorage | null = browserStorage(),
): number[] {
  const current = readChapters(seriesSlug, storage)
  if (!Number.isInteger(part) || part < 0 || current.includes(part)) return current
  const updated = [...current, part].sort((a, b) => a - b)
  try {
    // Entries for other series are kept as they are.
    const store = parseStore(rawStored(storage))
    store[seriesSlug] = updated
    storage?.setItem(SERIES_PROGRESS_KEY, JSON.stringify(store))
  } catch {
    // Storage is unavailable or full. The chapter is not remembered.
    return current
  }
  return updated
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
