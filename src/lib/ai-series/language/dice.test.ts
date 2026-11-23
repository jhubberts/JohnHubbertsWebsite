import { describe, expect, it } from 'vitest'
import data from './dice.json'
import { STOP_NAMES, leftOutCount, samplesFor, type DiceData, type DiceStart } from './dice'

const file = data as DiceData

const start: DiceStart = {
  text: 'Once',
  settings: [
    { temperature: 0, greedy: true, continuations: [{ sample: 1, text: 'a' }] },
    {
      temperature: 0.5,
      continuations: [
        { sample: 1, seed: 1, text: 'b' },
        { sample: 3, seed: 3, text: 'c' },
      ],
    },
  ],
}

describe('samplesFor', () => {
  it('returns the continuations in sample order', () => {
    expect(samplesFor(start, 1).map((s) => s.sample)).toEqual([1, 3])
  })

  it('returns nothing for a setting that does not exist', () => {
    expect(samplesFor(start, 9)).toEqual([])
  })
})

describe('leftOutCount', () => {
  const small: DiceData = {
    ...file,
    leftOut: [
      { start: 'Once', temperature: 0.5, sample: 2, reason: 'crude' },
      { start: 'Once', temperature: 0.5, sample: 4, reason: 'sexual' },
      { start: 'Other', temperature: 0.5, sample: 1, reason: 'crude' },
    ],
  }

  it('counts the entries for that start and setting only', () => {
    expect(leftOutCount(small, start, 1)).toBe(2)
    expect(leftOutCount(small, start, 0)).toBe(0)
    expect(leftOutCount(small, start, 9)).toBe(0)
  })
})

describe('the recorded dice file', () => {
  it('records as many continuations as it shows plus leaves out', () => {
    const shown = file.starts.reduce(
      (total, s) => total + s.settings.reduce((n, setting) => n + setting.continuations.length, 0),
      0,
    )
    expect(shown).toBe(file.shown)
    expect(file.leftOut).toHaveLength(file.recorded - file.shown)
    expect(
      file.starts.reduce(
        (total, s) => total + s.settings.reduce((n, _, i) => n + leftOutCount(file, s, i), 0),
        0,
      ),
    ).toBe(file.leftOut.length)
  })

  it('has one continuation at the lowest setting of every start', () => {
    for (const s of file.starts) {
      expect(s.settings[0].greedy).toBe(true)
      expect(samplesFor(s, 0)).toHaveLength(1)
    }
  })

  it('has a name for every recorded setting', () => {
    for (const s of file.starts) expect(s.settings).toHaveLength(STOP_NAMES.length)
  })

  it('keeps no text on a left-out entry', () => {
    for (const entry of file.leftOut) {
      expect(Object.keys(entry).sort()).toEqual(['reason', 'sample', 'start', 'temperature'])
    }
  })
})
