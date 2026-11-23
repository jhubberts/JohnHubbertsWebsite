import { describe, expect, it } from 'vitest'
import { PLACES, SOURCES, STEPS } from './steps'

const placeIds = PLACES.map((place) => place.id)
const sourceIds = SOURCES.map((source) => source.id)

describe('STEPS', () => {
  it('has nine steps with unique ids', () => {
    expect(STEPS).toHaveLength(9)
    expect(new Set(STEPS.map((step) => step.id)).size).toBe(9)
  })

  it('gives every step a title, a body, a quotation and a statement of who says so', () => {
    for (const step of STEPS) {
      expect(step.title.trim(), step.id).not.toBe('')
      expect(step.body.length, step.id).toBeGreaterThanOrEqual(1)
      expect(step.quotes.length, step.id).toBeGreaterThanOrEqual(1)
      expect(step.whoSaysSo.trim(), step.id).not.toBe('')
    }
  })

  it('quotes only known sources, and quotes every source at least once', () => {
    const quoted = new Set<string>()
    for (const step of STEPS) {
      for (const quote of step.quotes) {
        expect(sourceIds, step.id).toContain(quote.source)
        quoted.add(quote.source)
      }
    }
    expect([...quoted].sort()).toEqual([...sourceIds].sort())
  })

  it('keeps every quotation to 25 words or fewer', () => {
    for (const step of STEPS) {
      for (const quote of step.quotes) {
        const words = quote.text.trim().split(/\s+/).length
        expect(words, quote.text).toBeLessThanOrEqual(25)
      }
    }
  })
})

describe('places reached', () => {
  it('uses only known places', () => {
    for (const step of STEPS) {
      for (const place of step.reached) expect(placeIds, step.id).toContain(place)
      expect(placeIds, step.id).toContain(step.focus)
    }
  })

  it('starts with the test room alone', () => {
    expect(STEPS[0].reached).toEqual(['room'])
  })

  it('never loses a place from one step to the next', () => {
    for (let i = 1; i < STEPS.length; i += 1) {
      for (const place of STEPS[i - 1].reached) {
        expect(STEPS[i].reached, STEPS[i].id).toContain(place)
      }
    }
  })

  it('reaches places in the order room, store, internet, Hugging Face', () => {
    for (const step of STEPS) {
      const reached = new Set(step.reached)
      const flags = placeIds.map((id) => reached.has(id))
      const firstGap = flags.indexOf(false)
      if (firstGap !== -1) expect(flags.slice(firstGap), step.id).not.toContain(true)
    }
  })
})

describe('SOURCES', () => {
  it('links every report over https', () => {
    for (const source of SOURCES) expect(source.url.startsWith('https://'), source.id).toBe(true)
  })
})
