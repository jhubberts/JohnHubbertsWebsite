/**
 * How the series bar at the top of a chapter shows progress: as a row with one handwritten number
 * per chapter, or in a compact form with the open chapter's number and a line of text.
 */

export type SeriesBarForm = 'row' | 'compact'

/** The form below 640px wide (`phone`) and from 640px up (`wide`). */
export interface SeriesBarForms {
  phone: SeriesBarForm
  wide: SeriesBarForm
}

// The bar on a 375px phone has room for the series' short name and ten 20px numbers; from 640px it
// has room for 24 numbers of 22px.
const MOST_IN_ROW_ON_PHONE = 10
const MOST_IN_ROW_WIDE = 24

export function seriesBarForms(chapterCount: number): SeriesBarForms {
  return {
    phone: chapterCount <= MOST_IN_ROW_ON_PHONE ? 'row' : 'compact',
    wide: chapterCount <= MOST_IN_ROW_WIDE ? 'row' : 'compact',
  }
}

/** The text of the compact form, such as "Chapter 11 · 4 of 12 read". */
export function compactProgress(parts: number[], read: ReadonlySet<number>, current: number) {
  const readCount = parts.filter((part) => read.has(part)).length
  return `Chapter ${current} · ${readCount} of ${parts.length} read`
}
