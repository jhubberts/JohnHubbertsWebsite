import { describe, expect, it } from 'vitest'
import { NOTHING_YET, runToEnd, startProgram, step, type ProgramState } from './program'

function stepTimes(state: ProgramState, times: number): ProgramState {
  let current = state
  for (let i = 0; i < times; i++) current = step(current)
  return current
}

describe('the six-card program', () => {
  it('starts with Total and Next empty and nothing in the mill', () => {
    expect(startProgram(5)).toEqual({
      card: 1,
      total: null,
      next: null,
      last: 5,
      steps: 0,
      done: false,
      millText: NOTHING_YET,
    })
  })

  it('fills Total, then Next, without any arithmetic', () => {
    const afterOne = step(startProgram(5))
    expect(afterOne).toMatchObject({ card: 2, total: 0, next: null, millText: NOTHING_YET })
    expect(step(afterOne)).toMatchObject({ card: 3, total: 0, next: 1, millText: NOTHING_YET })
  })

  it('shows the arithmetic of one pass through cards 3, 4 and 5', () => {
    const atCardThree = stepTimes(startProgram(5), 2)
    const afterThree = step(atCardThree)
    expect(afterThree.millText).toBe('0 + 1 = 1')
    const afterFour = step(afterThree)
    expect(afterFour.millText).toBe('1 + 1 = 2')
    const afterFive = step(afterFour)
    expect(afterFive.millText).toBe('Is 2 more than 5? No, so go back to card 3.')
    expect(afterFive).toMatchObject({ card: 3, total: 1, next: 2, steps: 5 })
  })

  it('goes on to card 6 once Next is more than Last, and leaves the mill text on stopping', () => {
    const atCardSix = stepTimes(startProgram(5), 17)
    expect(atCardSix).toMatchObject({ card: 6, total: 15, next: 6, done: false })
    expect(atCardSix.millText).toBe('Is 6 more than 5? Yes, so go on to card 6.')
    const stopped = step(atCardSix)
    expect(stopped).toMatchObject({ card: 6, steps: 18, done: true })
    expect(stopped.millText).toBe(atCardSix.millText)
  })

  it('does nothing more once stopped', () => {
    const stopped = runToEnd(startProgram(5))
    expect(step(stopped)).toBe(stopped)
  })

  it.each([
    [5, 15, 18],
    [10, 55, 33],
    [100, 5050, 303],
  ])('with Last %i, ends with Total %i after %i cards', (last, total, steps) => {
    expect(runToEnd(startProgram(last))).toMatchObject({ total, steps, done: true })
  })

  it('runs to the end from partway through', () => {
    expect(runToEnd(stepTimes(startProgram(10), 7))).toMatchObject({ total: 55, steps: 33 })
  })
})
