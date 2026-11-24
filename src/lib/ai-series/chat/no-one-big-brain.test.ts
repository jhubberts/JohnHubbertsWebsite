import { describe, expect, it } from 'vitest'
import { BRAIN_MESSAGES, BRAIN_STEPS, CHIPS_IN_ONE_COPY } from './no-one-big-brain'

describe('no one big brain', () => {
  it('has four steps with unique ids, one per picture', () => {
    const ids = BRAIN_STEPS.map((step) => step.id)
    expect(ids).toEqual(['messages', 'copies', 'chips', 'forget'])
    expect(new Set(ids).size).toBe(4)
  })

  it('gives every step a title and body text', () => {
    for (const step of BRAIN_STEPS) {
      expect(step.title.trim()).not.toBe('')
      expect(step.body.length).toBeGreaterThan(0)
      for (const paragraph of step.body) expect(paragraph.trim()).not.toBe('')
    }
  })

  it('has three messages', () => {
    expect(BRAIN_MESSAGES).toHaveLength(3)
  })

  it('shows 16 chips and says so in the chips step', () => {
    expect(CHIPS_IN_ONE_COPY).toBe(16)
    const chips = BRAIN_STEPS.find((step) => step.id === 'chips')
    expect(chips?.body.join(' ')).toContain('16')
  })
})
