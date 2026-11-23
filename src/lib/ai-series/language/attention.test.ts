import { describe, expect, it } from 'vitest'
import data from './attention-shown.json'
import {
  attentionList,
  inHundredNumber,
  markersAreFirstAndLast,
  mostDrawnWord,
  positionOfIt,
  sentenceWords,
  type AttentionData,
  type SentenceId,
  type ViewId,
} from './attention'

const real = data as AttentionData
const IT = positionOfIt(real, 'A')

function toy(): AttentionData {
  const row = [0.1, 0.4, 0.05, 0.3, 0.15]
  const matrix = Array.from({ length: 5 }, () => row)
  return {
    model: 'toy',
    sentences: [
      {
        id: 'A',
        text: 'a b .',
        tokens: [
          { token: '[CLS]', special: true },
          { token: 'a' },
          { token: 'b' },
          { token: '.' },
          { token: '[SEP]', special: true },
        ],
      },
    ],
    views: { best: { layer: 1, head: 1, A: matrix, B: matrix }, average: { A: matrix, B: matrix } },
    summary: { heads: 1, switching: 1 },
  }
}

describe('attentionList', () => {
  it('lists every other word in sentence order, names the full stop, and adds the markers', () => {
    const list = attentionList(toy(), 'A', 'best', 1)
    expect(list.rows.map((r) => r.label)).toEqual(['b', 'the full stop'])
    expect(list.rows.map((r) => r.value)).toEqual([0.05, 0.3])
    expect(list.markers).toBeCloseTo(0.25)
  })

  it('marks the largest real word, never the full stop, and scales bars to the largest including markers', () => {
    const list = attentionList(toy(), 'A', 'best', 1)
    expect(list.rows.map((r) => r.isMost)).toEqual([true, false])
    expect(mostDrawnWord(list)).toBe('b')
    expect(list.largest).toBeCloseTo(0.3)
  })

  it('lets the markers set the scale when they are larger than every word', () => {
    const data = toy()
    data.views.best.A[1] = [0.45, 0.05, 0.1, 0.05, 0.35]
    expect(attentionList(data, 'A', 'best', 1).largest).toBeCloseTo(0.8)
  })
})

describe('the recorded attention', () => {
  const cases: [SentenceId, ViewId][] = [
    ['A', 'best'],
    ['B', 'best'],
    ['A', 'average'],
    ['B', 'average'],
  ]

  it.each(cases)('has rows that sum to 1 in sentence %s, view %s', (id, view) => {
    for (const row of real.views[view][id]) {
      expect(row.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 1)
    }
  })

  it('has 15 pieces per sentence with markers first and last, and "it" in the same place', () => {
    for (const id of ['A', 'B'] as const) {
      expect(real.sentences.find((s) => s.id === id)?.tokens).toHaveLength(15)
      expect(markersAreFirstAndLast(real, id)).toBe(true)
    }
    expect(positionOfIt(real, 'B')).toBe(IT)
    expect(sentenceWords(real, 'A')).toHaveLength(13)
  })

  it('has "it" drawing most on "animal" in the first sentence and "street" in the second in the best view', () => {
    expect(mostDrawnWord(attentionList(real, 'A', 'best', IT))).toBe('animal')
    expect(mostDrawnWord(attentionList(real, 'B', 'best', IT))).toBe('street')
  })

  it('has "it" drawing more on "animal" than "street" in both sentences in the average view', () => {
    for (const id of ['A', 'B'] as const) {
      const rows = attentionList(real, id, 'average', IT).rows
      const value = (word: string) => rows.find((r) => r.word === word)?.value ?? 0
      expect(value('animal')).toBeGreaterThan(value('street'))
    }
  })
})

describe('inHundredNumber', () => {
  it('multiplies by 100 and rounds', () => {
    expect(inHundredNumber(0.3349)).toBe('33')
  })

  it('says "less than 1" for a number above 0 that rounds to 0', () => {
    expect(inHundredNumber(0.0004)).toBe('less than 1')
    expect(inHundredNumber(0)).toBe('0')
  })
})
