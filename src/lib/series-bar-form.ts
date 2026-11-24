/**
 * How the series bar at the top of a chapter shows progress: as a row with one handwritten number
 * per chapter, or, for a series with more chapters than the row has room for, in a compact form
 * with the open chapter's number and a line of text.
 */

/**
 * The most chapters whose row fits below 640px: a 375px phone has room for the series' short
 * name and ten numbers of 20px.
 */
export const MOST_CHAPTERS_IN_ROW_ON_PHONE = 10

/** The most chapters whose row fits from 640px up, with numbers of 22px. */
export const MOST_CHAPTERS_IN_ROW_WIDE = 24

/** The text of the compact form, such as "Chapter 11 · 4 of 12 read". */
export function compactProgress(parts: number[], read: ReadonlySet<number>, current: number) {
  const readCount = parts.filter((part) => read.has(part)).length
  return `Chapter ${current} · ${readCount} of ${parts.length} read`
}
