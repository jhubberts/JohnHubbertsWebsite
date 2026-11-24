import { describe, expect, it } from 'vitest'
import { layoutNumber, type NumberLayout } from '@/lib/handwritten-number'
import { arrangeNumberRows, fitNumber } from './preview-numbers'

const layout = (value: number) => layoutNumber(value)!
const chapters = (count: number) => Array.from({ length: count }, (_, n) => layout(n))

// The values scripts/build-previews.ts uses for a series picture.
const options = { maxWidth: 1040, height: 84, minHeight: 48, gapRatio: 0.3 }

/** A row's width in pixels as drawn: its numbers at the shared height, plus the gaps. */
function rowWidth(layouts: NumberLayout[], row: number[], height: number, gap: number): number {
  const numbers = row.reduce((sum, i) => sum + (layouts[i].width * height) / layouts[i].height, 0)
  return numbers + (row.length - 1) * gap
}

describe('fitNumber', () => {
  it.each([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])(
    'draws the one-digit number %i at the full height',
    (digit) => {
      expect(fitNumber(layout(digit), 360, 360).height).toBe(360)
    },
  )

  it('keeps a two-digit number at the full height when it fits the width', () => {
    const size = fitNumber(layout(11), 360, 360)

    expect(size.height).toBe(360)
    expect(size.width).toBeLessThanOrEqual(360)
  })

  it('scales a number that is too wide down to exactly the width', () => {
    const size = fitNumber(layout(12), 360, 360)

    expect(size.width).toBeCloseTo(360)
    expect(size.height).toBeLessThan(360)
  })
})

describe('arrangeNumberRows', () => {
  it('draws ten chapters in one row at the full height', () => {
    const result = arrangeNumberRows(chapters(10), options)

    expect(result.rows).toEqual([[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]])
    expect(result.height).toBe(84)
  })

  it('shrinks fourteen chapters to fit one row, staying at least the smallest height', () => {
    const layouts = chapters(14)
    const result = arrangeNumberRows(layouts, options)

    expect(result.rows).toHaveLength(1)
    expect(result.height).toBeLessThan(84)
    expect(result.height).toBeGreaterThanOrEqual(48)
    expect(rowWidth(layouts, result.rows[0], result.height, result.gap)).toBeLessThanOrEqual(1040)
  })

  it('moves twenty-six chapters onto two rows, in order, each fitting the width', () => {
    const layouts = chapters(26)
    const result = arrangeNumberRows(layouts, options)

    expect(result.rows).toHaveLength(2)
    expect(result.rows.flat()).toEqual(layouts.map((_, i) => i))
    expect(result.height).toBeGreaterThanOrEqual(48)
    for (const row of result.rows) {
      expect(rowWidth(layouts, row, result.height, result.gap)).toBeLessThanOrEqual(1040)
    }
  })
})
