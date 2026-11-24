/**
 * The six-card program of chapter 1, which adds up the numbers from 1 to Last, carried out one
 * card at a time the way Babbage's Analytical Engine would: the store holds Total, Next and Last,
 * and the mill does the arithmetic.
 */

export const CARDS = [
  'Put 0 in Total.',
  'Put 1 in Next.',
  'Add Next to Total.',
  'Add 1 to Next.',
  'If Next is Last or less, go back to card 3.',
  'Stop. The answer is in Total.',
] as const

export const NOTHING_YET = 'Nothing yet.'

/** The most cards `runToEnd` carries out before it gives up. */
export const STEP_CAP = 10_000

export type ProgramState = {
  /** The card to carry out next, 1 to 6; when `done`, the card that stopped the machine. */
  card: number
  /** The number in Total, or null while Total is empty. */
  total: number | null
  /** The number in Next, or null while Next is empty. */
  next: number | null
  last: number
  /** How many cards have been carried out. */
  steps: number
  done: boolean
  /** The arithmetic the mill did last, or `NOTHING_YET` before it has done any. */
  millText: string
}

export function startProgram(last: number): ProgramState {
  return {
    card: 1,
    total: null,
    next: null,
    last,
    steps: 0,
    done: false,
    millText: NOTHING_YET,
  }
}

/**
 * Carries out the current card. Cards 1, 2 and 6 do no arithmetic, so they leave the mill's text
 * as it was. A stopped program is returned unchanged.
 */
export function step(state: ProgramState): ProgramState {
  if (state.done) return state
  const carried = { ...state, steps: state.steps + 1 }
  const total = state.total ?? 0
  const next = state.next ?? 0
  switch (state.card) {
    case 1:
      return { ...carried, card: 2, total: 0 }
    case 2:
      return { ...carried, card: 3, next: 1 }
    case 3:
      return {
        ...carried,
        card: 4,
        total: total + next,
        millText: `${total} + ${next} = ${total + next}`,
      }
    case 4:
      return { ...carried, card: 5, next: next + 1, millText: `${next} + 1 = ${next + 1}` }
    case 5:
      return next > state.last
        ? {
            ...carried,
            card: 6,
            millText: `Is ${next} more than ${state.last}? Yes, so go on to card 6.`,
          }
        : {
            ...carried,
            card: 3,
            millText: `Is ${next} more than ${state.last}? No, so go back to card 3.`,
          }
    default:
      return { ...carried, done: true }
  }
}

/** Carries out cards until the program stops, or until `STEP_CAP` cards have been carried out. */
export function runToEnd(state: ProgramState): ProgramState {
  let current = state
  while (!current.done && current.steps < STEP_CAP) current = step(current)
  return current
}
