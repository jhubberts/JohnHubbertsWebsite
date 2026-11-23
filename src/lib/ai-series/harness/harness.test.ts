import { describe, expect, it } from 'vitest'
import {
  DEFAULT_RULES,
  REQUESTS,
  applyRequest,
  changedParts,
  decideUnderRule,
  initialComputer,
  ruleFor,
  runDecisions,
  type Decision,
} from './harness'

const [list, read, deleteFile, deleteFolder, sendEmail] = REQUESTS

describe('applyRequest', () => {
  it('removes only the extra soup copy when request 3 is allowed', () => {
    const after = applyRequest(initialComputer(), deleteFile)
    expect(after).toEqual({ ...initialComputer(), recipeFiles: ['muffins.txt', 'soup.txt'] })
  })

  it('marks Photos deleted and leaves Recipes alone when request 4 is allowed', () => {
    const after = applyRequest(initialComputer(), deleteFolder)
    expect(after.photosDeleted).toBe(true)
    expect(after.recipeFiles).toEqual(initialComputer().recipeFiles)
  })

  it('sets emails sent to 40 when request 5 is allowed', () => {
    expect(applyRequest(initialComputer(), sendEmail).emailsSent).toBe(40)
  })

  it('leaves the computer unchanged for requests 1 and 2', () => {
    expect(applyRequest(initialComputer(), list)).toEqual(initialComputer())
    expect(applyRequest(initialComputer(), read)).toEqual(initialComputer())
  })

  it('does not change the state it is given', () => {
    const before = initialComputer()
    for (const request of REQUESTS) applyRequest(before, request)
    expect(before).toEqual(initialComputer())
  })
})

describe('runDecisions', () => {
  it('gives the initial computer when all five are refused', () => {
    const run = runDecisions(Array<Decision>(5).fill('refuse'))
    expect(run.computer).toEqual(initialComputer())
    expect(run.refused).toBe(5)
  })

  it('leaves the computer as it was for a refused request', () => {
    for (const [index] of REQUESTS.entries()) {
      const decisions = Array<Decision>(index + 1).fill('refuse')
      expect(runDecisions(decisions).computer).toEqual(initialComputer())
    }
  })

  it('counts allowed and refused for a mixed set', () => {
    const run = runDecisions(['allow', 'allow', 'allow', 'refuse', 'refuse'])
    expect(run.allowed).toBe(3)
    expect(run.refused).toBe(2)
    expect(run.computer.recipeFiles).toEqual(['muffins.txt', 'soup.txt'])
    expect(run.computer.photosDeleted).toBe(false)
    expect(run.computer.emailsSent).toBe(0)
  })
})

describe('rules', () => {
  it('has look always, change ask, email never by default', () => {
    expect(DEFAULT_RULES).toEqual({ look: 'always', change: 'ask', email: 'never' })
  })

  it('maps each request to the setting of its kind', () => {
    const rules = { look: 'never', change: 'always', email: 'ask' } as const
    expect(REQUESTS.map((r) => ruleFor(rules, r))).toEqual([
      'never',
      'never',
      'always',
      'always',
      'ask',
    ])
  })

  it('decides by the setting, and only asks when the setting is ask', () => {
    expect(decideUnderRule('always')).toBe('allow')
    expect(decideUnderRule('never', 'allow')).toBe('refuse')
    expect(decideUnderRule('ask')).toBeUndefined()
    expect(decideUnderRule('ask', 'refuse')).toBe('refuse')
  })
})

describe('changedParts', () => {
  it('names the lines that differ', () => {
    const start = initialComputer()
    expect(changedParts(start, applyRequest(start, deleteFile))).toEqual(['recipes'])
    expect(changedParts(start, applyRequest(start, deleteFolder))).toEqual(['photos'])
    expect(changedParts(start, applyRequest(start, sendEmail))).toEqual(['emails'])
    expect(changedParts(start, applyRequest(start, list))).toEqual([])
  })
})
