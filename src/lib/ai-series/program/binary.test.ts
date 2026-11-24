import { describe, expect, it } from 'vitest'
import { bitsToNumber, letterFor, letterWords, numberToBits, sumWords } from './binary'

const ALL_OFF = [false, false, false, false, false, false, false, false]

describe('eight switches', () => {
  it.each([
    [0, ALL_OFF, 'All off: 0', 'As a letter: (none)'],
    [
      1,
      [false, false, false, false, false, false, false, true],
      'Only the 1 switch is on: 1',
      'As a letter: (none)',
    ],
    [65, [false, true, false, false, false, false, false, true], '64 + 1 = 65', 'As a letter: A'],
    [
      128,
      [true, false, false, false, false, false, false, false],
      'Only the 128 switch is on: 128',
      'As a letter: (none)',
    ],
    [
      255,
      [true, true, true, true, true, true, true, true],
      '128 + 64 + 32 + 16 + 8 + 4 + 2 + 1 = 255',
      'As a letter: (none)',
    ],
  ])('%i', (value, bits, sum, letter) => {
    expect(numberToBits(value)).toEqual(bits)
    expect(bitsToNumber(bits)).toBe(value)
    expect(sumWords(bits)).toBe(sum)
    expect(letterWords(value)).toBe(letter)
  })

  it('reads the standard code from 32 to 126 only', () => {
    expect(letterFor(31)).toBeNull()
    expect(letterFor(32)).toBe(' ')
    expect(letterFor(97)).toBe('a')
    expect(letterFor(126)).toBe('~')
    expect(letterFor(127)).toBeNull()
  })

  it('refuses a number eight switches cannot make', () => {
    expect(() => numberToBits(256)).toThrow(RangeError)
    expect(() => numberToBits(-1)).toThrow(RangeError)
  })
})
