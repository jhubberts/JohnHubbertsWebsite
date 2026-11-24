import { describe, expect, it } from 'vitest'
import data from './chapter-digits.json'
import { digitPaths, layoutNumber } from './handwritten-number'

/** The first and last inked columns of a digit image. */
function inkColumns(rows: string[]): { minX: number; maxX: number } {
  const columns = rows.flatMap((row) => [...row].flatMap((c, x) => (c === '0' ? [] : [x])))
  return { minX: Math.min(...columns), maxX: Math.max(...columns) }
}

describe('layoutNumber', () => {
  it('cuts a single digit to its ink, with one unit of margin at each side', () => {
    const { minX, maxX } = inkColumns(data.digits.find((d) => d.label === 7)!.rows)

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
    expect(digitPaths(1, 'first').paths).not.toEqual(digitPaths(1, 'second').paths)
  })

  it('lays out a three-digit number, returning to the first sample on a third appearance', () => {
    const layout = layoutNumber(111)!

    expect(layout.digits.map((d) => d.sample)).toEqual(['first', 'second', 'first'])
    expect(layout.digits.map((d) => d.digit)).toEqual([1, 1, 1])
    expect(layout.top).toBe(3)
    expect(layout.height).toBe(24)
  })

  it.each([
    ['a negative number', -1],
    ['a fraction', 1.5],
    ['NaN', NaN],
    ['infinity', Infinity],
    ['negative infinity', -Infinity],
  ])('returns null for %s', (_name, value) => {
    expect(layoutNumber(value)).toBeNull()
  })
})
