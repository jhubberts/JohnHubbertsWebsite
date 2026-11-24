/**
 * Sizes the handwritten chapter numbers in the preview pictures. Nothing here draws or reads
 * files, so the sizing can be tested directly; scripts/build-previews.ts draws the numbers.
 */
import type { NumberLayout } from '@/lib/handwritten-number'

export interface Size {
  width: number
  height: number
}

/**
 * The size at which a number is drawn: as tall as `maxHeight`, unless that would make it wider
 * than `maxWidth`, in which case it is scaled down until it is exactly `maxWidth` wide.
 */
export function fitNumber(layout: NumberLayout, maxWidth: number, maxHeight: number): Size {
  const scale = Math.min(maxHeight / layout.height, maxWidth / layout.width)
  return { width: layout.width * scale, height: layout.height * scale }
}

export interface NumberRowsOptions {
  /** The widest a row may be, in pixels. */
  maxWidth: number
  /** The height of the numbers when they fit in one row at that height. */
  height: number
  /** Below this height, the numbers move onto one more row instead of shrinking further. */
  minHeight: number
  /** The space between two numbers, and between two rows, as a fraction of the numbers' height. */
  gapRatio: number
}

export interface NumberRows {
  /** The numbers' indices in `layouts`, row by row. */
  rows: number[][]
  /** The height every number is drawn at, in whole pixels. */
  height: number
  /** The space between two numbers in a row and between two rows. */
  gap: number
}

/**
 * Splits items of the given widths, in order, into `rowCount` rows so that the widest row is as
 * narrow as it can be, where a row's width is its items' widths plus `gap` between each two.
 * Returns the items' indices row by row, and the widest row's width.
 */
function splitIntoRows(
  widths: number[],
  rowCount: number,
  gap: number,
): { rows: number[][]; widest: number } {
  const n = widths.length
  const rowWidth = (start: number, end: number) =>
    widths.slice(start, end).reduce((sum, w) => sum + w, 0) + (end - start - 1) * gap
  // best[r][i]: the narrowest widest row for the first i items in r rows; cut[r][i] is where the
  // last of those rows starts.
  const best = Array.from({ length: rowCount + 1 }, () => Array<number>(n + 1).fill(Infinity))
  const cut = Array.from({ length: rowCount + 1 }, () => Array<number>(n + 1).fill(0))
  best[0][0] = 0
  for (let r = 1; r <= rowCount; r++) {
    for (let i = 1; i <= n; i++) {
      for (let start = r - 1; start < i; start++) {
        const widest = Math.max(best[r - 1][start], rowWidth(start, i))
        if (widest < best[r][i]) {
          best[r][i] = widest
          cut[r][i] = start
        }
      }
    }
  }
  const rows: number[][] = []
  for (let r = rowCount, end = n; r > 0; r--) {
    const start = cut[r][end]
    rows.unshift(Array.from({ length: end - start }, (_, k) => start + k))
    end = start
  }
  return { rows, widest: best[rowCount][n] }
}

/**
 * Arranges a series' chapter numbers in rows under the picture's title. They share one height:
 * `height` when they fit in one row, otherwise the height at which the widest row just fits. If
 * that would be below `minHeight`, they are split, in order, into one more row, with the split
 * chosen to make the widest row as narrow as possible, and the height is worked out again. Every
 * row fits in `maxWidth`.
 */
export function arrangeNumberRows(layouts: NumberLayout[], options: NumberRowsOptions): NumberRows {
  const { maxWidth, height, minHeight, gapRatio } = options
  if (layouts.length === 0) return { rows: [], height, gap: height * gapRatio }
  // Each number's width per pixel of its height; the gap is measured the same way.
  const widths = layouts.map((layout) => layout.width / layout.height)
  let arranged: NumberRows = { rows: [], height: 0, gap: 0 }
  for (let rowCount = 1; rowCount <= layouts.length; rowCount++) {
    const { rows, widest } = splitIntoRows(widths, rowCount, gapRatio)
    const rowHeight = Math.floor(Math.min(height, maxWidth / widest))
    arranged = { rows, height: rowHeight, gap: rowHeight * gapRatio }
    if (rowHeight >= minHeight) break
  }
  return arranged
}
