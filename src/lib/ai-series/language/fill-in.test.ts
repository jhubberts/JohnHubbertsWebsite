import { describe, expect, it } from 'vitest'
import data from './fill-in.json'
import { hiddenWords, roundFor, type FillInData } from './fill-in'

const real = data as FillInData

describe('roundFor', () => {
  it('offers the four hidden words in sentence order', () => {
    expect(hiddenWords(real)).toEqual(['animal', 'cross', 'street', 'tired'])
  })

  it('shows both sides of the gap to the first game and only the words before it to the second', () => {
    const expected = {
      animal: [
        'The ____ did not cross the street because it was too tired.',
        'The',
        ['animal', 'did', 'not', 'cross', 'the', 'street', 'because', 'it', 'was', 'too', 'tired.'],
      ],
      street: [
        'The animal did not cross the ____ because it was too tired.',
        'The animal did not cross the',
        ['because', 'it', 'was', 'too', 'tired.'],
      ],
      tired: [
        'The animal did not cross the street because it was too ____.',
        'The animal did not cross the street because it was too',
        ['.'],
      ],
    } as const
    for (const [word, [text, before]] of Object.entries(expected)) {
      const round = roundFor(real, word)
      expect(round.bothSides.text).toBe(text)
      expect(round.beforeOnly.before).toBe(before)
    }
    expect(roundFor(real, 'street').beforeOnly.hidden).toEqual(expected.street[2])
    expect(roundFor(real, 'tired').beforeOnly.hidden).toEqual(['.'])
    expect(roundFor(real, 'cross').beforeOnly.hidden).toEqual([
      'the',
      'street',
      'because',
      'it',
      'was',
      'too',
      'tired.',
    ])
  })

  it.each(hiddenWords(real))('has five rows per game, highest first, for "%s"', (word) => {
    const round = roundFor(real, word)
    for (const game of [round.bothSides.game, round.beforeOnly.game]) {
      expect(game.rows).toHaveLength(5)
      const numbers = game.rows.map((r) => r.p)
      expect(numbers).toEqual([...numbers].sort((a, b) => b - a))
    }
  })

  it('reports the real word as recorded, using the rank among all words for the second game', () => {
    const street = roundFor(real, 'street')
    expect(street.bothSides.game.real).toEqual({ word: 'street', rank: 12, p: 0.0154 })
    expect(street.beforeOnly.game.real).toEqual({ word: 'street', rank: 4, p: 0.0599 })
    const animal = roundFor(real, 'animal')
    expect(animal.beforeOnly.game.real.rank).toBe(1457)
    expect(animal.bothSides.game.real.rank).toBe(25)
  })

  it("removes the leading space from the second model's words", () => {
    expect(roundFor(real, 'cross').beforeOnly.game.rows[0].word).toBe('have')
  })

  it('throws for a word that was not recorded', () => {
    expect(() => roundFor(real, 'dog')).toThrow()
  })
})
