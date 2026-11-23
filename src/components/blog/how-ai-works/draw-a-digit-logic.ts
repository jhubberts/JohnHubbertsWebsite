// Pure helpers for the chapter's digit interactives: number formatting, display scaling, the order
// the example digits are shown in, and the "Watch it learn" practice counts and labels.

import { readDigit, type DigitNet } from '@/lib/ai-series/digits/digit-net'

/** A probability (0 to 1) as a whole number out of 100. */
export function outOf100(probability: number): number {
  return Math.round(probability * 100)
}

/** Formats a number with a fixed count of decimals, using a real minus sign and never "-0.0". */
export function formatNumber(value: number, decimals: number): string {
  const text = Math.abs(value).toFixed(decimals)
  const isZero = Number(text) === 0
  return value < 0 && !isZero ? `−${text}` : text
}

/** Index of the largest value; the first one wins a tie. */
export function largestIndex(values: ArrayLike<number>): number {
  let best = 0
  for (let i = 1; i < values.length; i++) {
    if (values[i] > values[best]) best = i
  }
  return best
}

/** Each value divided by the largest absolute value, so the strongest is 1 (or -1). */
export function relativeStrengths(values: ArrayLike<number>): Float32Array {
  let max = 0
  for (let i = 0; i < values.length; i++) max = Math.max(max, Math.abs(values[i]))
  const out = new Float32Array(values.length)
  if (max === 0) return out
  for (let i = 0; i < values.length; i++) out[i] = values[i] / max
  return out
}

/** The total of the positive contributions, and the size of the total of the negative ones. */
export function raiseAndLower(contributions: ArrayLike<number>): { raise: number; lower: number } {
  let raise = 0
  let lower = 0
  for (let i = 0; i < contributions.length; i++) {
    const c = contributions[i]
    if (c > 0) raise += c
    else lower -= c
  }
  return { raise, lower }
}

export interface Contributor {
  /** Index of the incoming unit, from 0. */
  index: number
  /** What it adds to the total; negative means it takes away. */
  amount: number
}

/** Up to `count` non-zero contributions, largest effect (either sign) first. */
export function topContributors(contributions: ArrayLike<number>, count = 5): Contributor[] {
  const nonZero: Contributor[] = []
  for (let i = 0; i < contributions.length; i++) {
    if (contributions[i] !== 0) nonZero.push({ index: i, amount: contributions[i] })
  }
  nonZero.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount) || a.index - b.index)
  return nonZero.slice(0, count)
}

/** The order the example digits are shown in: mixed, starting with a 7, each label twice. */
export const EXAMPLE_LABEL_ORDER = [7, 2, 9, 0, 4, 8, 1, 5, 3, 6, 3, 6, 1, 8, 0, 5, 9, 2, 7, 4]

/**
 * Indices into `labels` (the fixture's images) in the order of `labelOrder`. Each image is used
 * once; images whose label is not in `labelOrder` go at the end in their own order.
 */
export function exampleOrder(
  labels: readonly number[],
  labelOrder: readonly number[] = EXAMPLE_LABEL_ORDER,
): number[] {
  const used = new Set<number>()
  const order: number[] = []
  for (const label of labelOrder) {
    const index = labels.findIndex((l, i) => l === label && !used.has(i))
    if (index >= 0) {
      used.add(index)
      order.push(index)
    }
  }
  labels.forEach((_, i) => {
    if (!used.has(i)) order.push(i)
  })
  return order
}

/** The row and column (from 0) of a point on a square grid of `cells` by `cells` drawn `size` wide. */
export function cellAt(
  x: number,
  y: number,
  size: number,
  cells = 28,
): { row: number; column: number } {
  const clamp = (v: number) => Math.min(cells - 1, Math.max(0, Math.floor((v / size) * cells)))
  return { row: clamp(y), column: clamp(x) }
}

/** The four numbers of a unit's sentence, as they are shown. */
export interface ShownSum {
  adds: number
  takesAway: number
  start: number
  total: number
}

/**
 * The four numbers to show for "adds, takes away, starts from, total", each a multiple of 0.1,
 * chosen so that adds - takes away + start equals the total exactly. The total, start and adds are
 * rounded to one decimal; takes away is whatever makes the sum work, and never below zero.
 */
export function shownSum(adds: number, start: number, total: number): ShownSum {
  const tenths = (value: number) => Math.round(value * 10)
  const shownTotal = tenths(total)
  const shownStart = tenths(start)
  let shownAdds = tenths(adds)
  let shownTakesAway = shownAdds + shownStart - shownTotal
  if (shownTakesAway < 0) {
    shownTakesAway = 0
    shownAdds = shownTotal - shownStart
  }
  return {
    adds: shownAdds / 10,
    takesAway: shownTakesAway / 10,
    start: shownStart / 10,
    total: shownTotal / 10,
  }
}

/**
 * The longer side of the box around the ink above 0.05, as a fraction of the pad's side; 0 when
 * there is no ink. `ink` is row-major, values 0 to 1.
 */
export function inkSpan(ink: ArrayLike<number>, width: number, height: number): number {
  let minX = width
  let maxX = -1
  let minY = height
  let maxY = -1
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (ink[y * width + x] > 0.05) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
  if (maxX < 0) return 0
  return Math.max(maxX - minX + 1, maxY - minY + 1) / Math.max(width, height)
}

/** How many digits the training set holds; the last stop's label counts practice in these. */
export const TRAINING_SET_SIZE = 60000

/** A whole number with a comma between thousands, the same in every locale: 1280 is "1,280". */
export function withCommas(value: number): string {
  return Math.round(value).toLocaleString('en-US')
}

/** How many example digits the network had practised on after `step` steps of `batchSize` each. */
export function practiceCount(step: number, batchSize: number): number {
  return step * batchSize
}

/** How many times over the whole training set `count` digits is, as a whole number. */
export function timesOver(count: number, setSize = TRAINING_SET_SIZE): number {
  return Math.round(count / setSize)
}

/**
 * The line under the "How much practice" slider for stop `index` of `stopCount`: plain words for
 * the first stop, then the count of practice digits, plus how many times over the training set
 * that is once the count reaches the size of the training set.
 */
export function practiceLabel(
  index: number,
  stopCount: number,
  step: number,
  batchSize: number,
): string {
  if (index === 0) return 'Before any practice. Its numbers are random.'
  const count = practiceCount(step, batchSize)
  const base = `After practising on ${withCommas(count)} example digits.`
  if (count < TRAINING_SET_SIZE) return base
  const times = timesOver(count)
  if (times <= 1)
    return `${base} That is each of the ${withCommas(TRAINING_SET_SIZE)} digits about once.`
  return `${base} That is the same ${withCommas(TRAINING_SET_SIZE)} digits, about ${times} times over.`
}

/** The digit the network reads in each 28x28 image (pixels 0 to 255), in order. */
export function answersFor(net: DigitNet, images: readonly { pixels: number[] }[]): number[] {
  return images.map(
    ({ pixels }) =>
      readDigit(
        net,
        Float32Array.from(pixels, (p) => p / 255),
      ).answer,
  )
}

/** How many answers equal the label at the same position. */
export function countRight(answers: readonly number[], labels: readonly number[]): number {
  return answers.filter((answer, i) => answer === labels[i]).length
}
