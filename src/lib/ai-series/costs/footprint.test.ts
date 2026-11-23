import { describe, expect, it } from 'vitest'
import {
  ANSWER_FIGURES,
  COMPARISONS,
  HEAVIER_REQUESTS,
  QUESTIONS_PER_DAY,
  US_TOTALS,
  US_WATER,
  WATER_FIGURES,
  WORLD_TOTALS,
} from './figures'
import {
  answersFor,
  basisTag,
  partOfWorld,
  twoSignificant,
  waterSpread,
  yearlyTerawattHours,
} from './footprint'

function figure(id: string) {
  const found = ANSWER_FIGURES.find((f) => f.id === id)
  if (!found) throw new Error(`no figure ${id}`)
  return found
}

function yearlyFor(id: string) {
  return yearlyTerawattHours(QUESTIONS_PER_DAY.count, figure(id).wattHours)
}

describe('twoSignificant', () => {
  it.each([
    [37.5, '38'],
    [387.5, '390'],
    [320.8, '320'],
    [31, '31'],
    [1616.6, '1,600'],
    [0.3103, '0.31'],
    [2.7375, '2.7'],
  ])('writes %d as %s', (n, shown) => {
    expect(twoSignificant(n)).toBe(shown)
  })
})

describe('answersFor', () => {
  it('rounds to two significant figures and says "answers"', () => {
    expect(answersFor(9, 0.24).wording).toBe('= about 38 answers')
    expect(answersFor(93, 0.24).wording).toBe('= about 390 answers')
    expect(answersFor(93, 3).wording).toBe('= about 31 answers')
  })

  it('says "1 answer" when the count is below 1.5', () => {
    expect(answersFor(1.4, 1).wording).toBe('= about 1 answer')
  })
})

describe('yearlyTerawattHours', () => {
  it.each([
    ['openai', '0.31'],
    ['google', '0.22'],
    ['epoch', '0.27'],
    ['older', '2.7'],
  ])('gives %s as %s terawatt-hours', (id, shown) => {
    expect(twoSignificant(yearlyFor(id))).toBe(shown)
  })
})

describe('partOfWorld', () => {
  it.each([
    ['openai', '1,600'],
    ['google', '2,200'],
    ['epoch', '1,800'],
    ['older', '180'],
  ])('gives %s as 1 part in %s', (id, shown) => {
    expect(twoSignificant(partOfWorld(yearlyFor(id), 485))).toBe(shown)
  })
})

describe('the published figures', () => {
  const labelled = [
    ...ANSWER_FIGURES,
    ...COMPARISONS,
    ...WORLD_TOTALS,
    ...US_TOTALS,
    ...WATER_FIGURES,
  ]

  it('all have a label and a detail', () => {
    for (const entry of labelled) {
      expect(entry.label.trim(), entry.id).not.toBe('')
      expect(entry.detail.trim(), entry.id).not.toBe('')
    }
  })

  it('link only to https addresses', () => {
    const urls = [
      ...labelled.map((entry) => entry.source?.url),
      ...HEAVIER_REQUESTS.map((request) => request.source.url),
      QUESTIONS_PER_DAY.source.url,
      US_WATER.source.url,
    ].filter((url) => url !== undefined)
    expect(urls.length).toBeGreaterThan(0)
    for (const url of urls) expect(url).toMatch(/^https:\/\//)
  })

  it('give each answer figure its own id', () => {
    const ids = ANSWER_FIGURES.map((f) => f.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('give every per-answer figure a tag the reader can see', () => {
    for (const entry of [...ANSWER_FIGURES, ...WATER_FIGURES]) {
      expect(basisTag(entry.basis), entry.id).not.toBeNull()
    }
  })

  it('put the world’s data centers at 485 terawatt-hours in 2025', () => {
    expect(WORLD_TOTALS.find((t) => t.id === 'world-2025')?.terawattHours).toBe(485)
  })

  it('make the largest water figure more than a hundred times the smallest', () => {
    const { smallest, largest } = waterSpread(WATER_FIGURES)
    expect(largest / smallest).toBeGreaterThan(100)
  })
})
