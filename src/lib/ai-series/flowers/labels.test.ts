import { describe, expect, it } from 'vitest'
import { FLOWERS, runMachine, toPlotLine } from './flowers'
import {
  WRONG_LABEL_COUNTS,
  labeledFlowers,
  learnFromLabels,
  swappedFlowers,
  type Learned,
} from './labels'

function learn(count: number): Learned {
  return learnFromLabels(labeledFlowers(swappedFlowers(count)))
}

describe('swappedFlowers', () => {
  it('swaps the chosen number of different flowers', () => {
    for (const count of WRONG_LABEL_COUNTS) {
      const swapped = swappedFlowers(count)
      expect(new Set(swapped).size).toBe(count)
      for (const i of swapped) expect(i >= 0 && i < 100).toBe(true)
    }
  })

  it('keeps the 5 inside the 20 inside the 50', () => {
    const [none, five, twenty, fifty] = WRONG_LABEL_COUNTS.map(swappedFlowers)
    expect(none).toEqual([])
    for (const i of five) expect(twenty).toContain(i)
    for (const i of twenty) expect(fifty).toContain(i)
  })

  it('is the same on every call', () => {
    expect(swappedFlowers(20)).toEqual([
      3, 4, 6, 10, 12, 15, 18, 19, 22, 32, 38, 51, 57, 73, 74, 80, 82, 85, 89, 93,
    ])
  })
})

describe('labeledFlowers', () => {
  it('swaps only the given flowers, and keeps every place', () => {
    const labeled = labeledFlowers([0, 99])
    expect(labeled[0]).toEqual({ ...FLOWERS[0], species: 'versicolor' })
    expect(labeled[99]).toEqual({ ...FLOWERS[99], species: 'setosa' })
    expect(labeled.slice(1, 99)).toEqual(FLOWERS.slice(1, 99))
  })
})

describe('learnFromLabels', () => {
  it('with no wrong labels, ends on chapter 3’s line with all 100 right both ways', () => {
    const learned = learn(0)
    const states = runMachine()
    expect(learned.line).toEqual(toPlotLine(states[states.length - 1].line))
    expect(learned).toMatchObject({ rightByLabels: 100, rightBySpecies: 100 })
  })

  it('gives the same results on every run for 5, 20 and 50 wrong labels', () => {
    const results = [5, 20, 50].map((count) => {
      const { rightByLabels, rightBySpecies } = learn(count)
      return { count, rightByLabels, rightBySpecies }
    })
    expect(results).toEqual([
      { count: 5, rightByLabels: 94, rightBySpecies: 99 },
      { count: 20, rightByLabels: 81, rightBySpecies: 99 },
      { count: 50, rightByLabels: 57, rightBySpecies: 35 },
    ])
    expect(learn(20)).toEqual(learn(20))
  })
})
