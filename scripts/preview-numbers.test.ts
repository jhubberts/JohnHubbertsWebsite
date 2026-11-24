import { describe, expect, it } from 'vitest'
import { layoutNumber, type NumberLayout } from '@/lib/handwritten-number'
import {
  arrangeNumberRows,
  CHAPTER_NUMBER_BOX,
  fitNumber,
  SERIES_NUMBER_OPTIONS,
} from './preview-numbers'

const layout = (value: number) => layoutNumber(value)!
const chapters = (count: number) => Array.from({ length: count }, (_, n) => layout(n))

// The sizes the build uses for a series picture and for a chapter's number.
const options = SERIES_NUMBER_OPTIONS
const box = CHAPTER_NUMBER_BOX

/** A row's width in pixels as drawn: its numbers at the shared height, plus the gaps. */
function rowWidth(layouts: NumberLayout[], row: number[], height: number, gap: number): number {
  const numbers = row.reduce((sum, i) => sum + (layouts[i].width * height) / layouts[i].height, 0)
  return numbers + (row.length - 1) * gap
}

describe('fitNumber', () => {
  it.each([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])(
    'draws the one-digit number %i at the full height',
    (digit) => {
      expect(fitNumber(layout(digit), box, box).height).toBe(box)
    },
  )

  it('keeps a two-digit number at the full height when it fits the width', () => {
    const size = fitNumber(layout(11), box, box)

    expect(size.height).toBe(box)
    expect(size.width).toBeLessThanOrEqual(box)
  })

  it('scales a number that is too wide down to exactly the width', () => {
    const size = fitNumber(layout(12), box, box)

    expect(size.width).toBeCloseTo(box)
    expect(size.height).toBeLessThan(box)
  })
})

describe('arrangeNumberRows', () => {
  it('draws ten chapters in one row at the full height', () => {
    const result = arrangeNumberRows(chapters(10), options)

    expect(result.rows).toEqual([[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]])
    expect(result.height).toBe(options.height)
  })

  it('shrinks fourteen chapters to fit one row, staying at least the smallest height', () => {
    const layouts = chapters(14)
    const result = arrangeNumberRows(layouts, options)

    expect(result.rows).toHaveLength(1)
    expect(result.height).toBeLessThan(options.height)
    expect(result.height).toBeGreaterThanOrEqual(options.minHeight)
    expect(rowWidth(layouts, result.rows[0], result.height, result.gap)).toBeLessThanOrEqual(
      options.maxWidth,
    )
  })

  it('moves twenty-six chapters onto two rows, in order, each fitting the width', () => {
    const layouts = chapters(26)
    const result = arrangeNumberRows(layouts, options)

    expect(result.rows).toHaveLength(2)
    expect(result.rows.flat()).toEqual(layouts.map((_, i) => i))
    expect(result.height).toBeGreaterThanOrEqual(options.minHeight)
    for (const row of result.rows) {
      expect(rowWidth(layouts, row, result.height, result.gap)).toBeLessThanOrEqual(
        options.maxWidth,
      )
    }
  })
})
