/**
 * Lays out a whole number (0, 7, 12, 404) from the real handwritten digits in chapter-digits.json,
 * and builds the SVG path data that draws each digit. The site's React components and the build
 * script that draws preview pictures both draw numbers from here.
 */
import data from './chapter-digits.json'

/** The number of ink levels in the digit images; level 0 is blank paper. */
export const INK_LEVELS = data.levels

// In all twenty digit images the ink lies in rows 3 to 26, so every number is cut to those rows
// and all numbers share one baseline and one height.
const TOP = 3
const HEIGHT = 24
// Units of empty space between two digits of a number, and at each side of the whole number. One
// unit is one pixel of the 28-by-28 images.
const GAP = 2
const MARGIN = 1

export type DigitSample = 'first' | 'second'

/** One handwritten digit placed inside a number: which sample, and where its ink goes. */
export interface PlacedDigit {
  digit: number
  sample: DigitSample
  /** Where the digit's first inked column lands, in units from the number's left edge. */
  offsetX: number
  /** The digit's first inked column in its own 28-by-28 image. */
  minX: number
  /** How many columns, from `minX`, the digit's ink spans. */
  width: number
}

/** How to draw a whole number (0 or more) from handwritten digits, left to right. */
export interface NumberLayout {
  digits: PlacedDigit[]
  /** The whole number's width in units, margins included. */
  width: number
  /** The first image row drawn. */
  top: number
  /** How many image rows are drawn. */
  height: number
}

function rowsFor(digit: number, sample: DigitSample): string[] {
  const list = sample === 'first' ? data.digits : data.alternates
  const entry = list.find((d) => d.label === digit)
  if (!entry) throw new Error(`No ${sample} handwritten ${digit} in chapter-digits.json`)
  return entry.rows
}

interface Ink {
  minX: number
  width: number
  /** One path string per ink level (index 0 is level 1), with column `minX` moved to x = 0. */
  paths: string[]
}

const inkCache = new Map<string, Ink>()

function inkFor(digit: number, sample: DigitSample): Ink {
  const key = `${digit}:${sample}`
  const cached = inkCache.get(key)
  if (cached) return cached
  const rows = rowsFor(digit, sample)
  let minX = Infinity
  let maxX = -Infinity
  for (const row of rows) {
    for (let x = 0; x < row.length; x++) {
      if (row[x] !== '0') {
        minX = Math.min(minX, x)
        maxX = Math.max(maxX, x)
      }
    }
  }
  const paths: string[] = Array.from({ length: INK_LEVELS }, () => '')
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const level = Number(row[x])
      if (level >= 1 && level <= INK_LEVELS) paths[level - 1] += `M${x - minX} ${y}h1v1h-1z`
    }
  })
  const ink = { minX, width: maxX - minX + 1, paths }
  inkCache.set(key, ink)
  return ink
}

/**
 * The path data for one digit sample, one string per ink level (index 0 is level 1; an empty
 * string means no pixel has that level), and the digit's first inked column in its own image.
 * Each pixel is a 1-by-1 square. Columns count from the first inked column, so a caller moves the
 * digit right by its `offsetX` to place it in a number, or by `minX` to put it where it lies in
 * its own image. Rows are the image's own rows.
 */
export function digitPaths(digit: number, sample: DigitSample): { minX: number; paths: string[] } {
  const { minX, paths } = inkFor(digit, sample)
  return { minX, paths }
}

/**
 * Places the digits of `value` left to right, each cut to its own ink, with a gap of 2 units
 * between digits and 1 unit of margin at each side. A digit that already appeared earlier in the
 * number is drawn from the second sample, so 11 shows two different handwritten 1s; a third
 * appearance goes back to the first sample. Returns null for a value that is negative, not an
 * integer, or too large to write out digit by digit.
 */
export function layoutNumber(value: number): NumberLayout | null {
  if (!Number.isSafeInteger(value) || value < 0) return null
  const seen = new Map<number, number>()
  const digits: PlacedDigit[] = []
  let x = MARGIN
  for (const character of String(value)) {
    const digit = Number(character)
    const count = seen.get(digit) ?? 0
    seen.set(digit, count + 1)
    const sample: DigitSample = count % 2 === 0 ? 'first' : 'second'
    const { minX, width } = inkFor(digit, sample)
    digits.push({ digit, sample, offsetX: x, minX, width })
    x += width + GAP
  }
  return { digits, width: x - GAP + MARGIN, top: TOP, height: HEIGHT }
}
