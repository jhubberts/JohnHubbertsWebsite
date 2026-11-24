import { describe, expect, it } from 'vitest'
import data from './chapter-digits.json'
import { digitPaths, INK_LEVELS, layoutNumber } from './handwritten-number'

/** The first and last inked columns of a digit image. */
function inkColumns(rows: string[]): { minX: number; maxX: number } {
  const columns = rows.flatMap((row) => [...row].flatMap((c, x) => (c === '0' ? [] : [x])))
  return { minX: Math.min(...columns), maxX: Math.max(...columns) }
}

describe('layoutNumber', () => {
  it('cuts a single digit to its ink, with one unit of margin at each side', () => {
    const { minX, maxX } = inkColumns(data.digits[7].rows)

    expect(layoutNumber(7)).toEqual({
      digits: [{ digit: 7, sample: 'first', offsetX: 1, minX, width: maxX - minX + 1 }],
      width: maxX - minX + 3,
      top: 3,
      height: 24,
    })
  })

  it('places the digits of 10 left to right with a gap of 2 units', () => {
    const layout = layoutNumber(10)!
    const [one, zero] = layout.digits

    expect(layout.digits.map((d) => [d.digit, d.sample])).toEqual([
      [1, 'first'],
      [0, 'first'],
    ])
    expect(zero.offsetX).toBe(one.offsetX + one.width + 2)
    expect(layout.width).toBe(zero.offsetX + zero.width + 1)
  })

  it('draws 11 from two different handwritten 1s', () => {
    const layout = layoutNumber(11)!

    expect(layout.digits.map((d) => d.sample)).toEqual(['first', 'second'])
    expect(digitPaths(1, 'first')).not.toEqual(digitPaths(1, 'second'))
  })

  it('makes the width the sum of the digit widths, the gaps and the margins', () => {
    for (const value of [0, 9, 10, 23, 404, 1111]) {
      const layout = layoutNumber(value)!
      const inkWidth = layout.digits.reduce((sum, d) => sum + d.width, 0)

      expect(layout.width).toBe(inkWidth + 2 * (layout.digits.length - 1) + 2)
    }
  })

  it('lays out a three-digit number, returning to the first sample on a third appearance', () => {
    const layout = layoutNumber(111)!

    expect(layout.digits.map((d) => d.sample)).toEqual(['first', 'second', 'first'])
    expect(layout.digits.map((d) => d.digit)).toEqual([1, 1, 1])
    expect(layout.top).toBe(3)
    expect(layout.height).toBe(24)
  })

  it('returns null for negative, fractional and non-finite values', () => {
    for (const value of [-1, 1.5, NaN, Infinity, -Infinity]) {
      expect(layoutNumber(value)).toBeNull()
    }
  })
})

describe('digitPaths', () => {
  it('draws one square for every inked pixel of each 4, at its ink level', () => {
    for (const [sample, entry] of [
      ['first', data.digits[4]],
      ['second', data.alternates[4]],
    ] as const) {
      const paths = digitPaths(4, sample)

      expect(paths).toHaveLength(INK_LEVELS)
      paths.forEach((d, index) => {
        const level = String(index + 1)
        const pixels = entry.rows
          .join('')
          .split('')
          .filter((c) => c === level).length

        expect(d.match(/M/g)?.length ?? 0).toBe(pixels)
      })
    }
  })
})
