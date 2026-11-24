/** Eight on/off switches read as a whole number from 0 to 255, as in chapter 2. */

/** What each switch is worth, leftmost first. */
export const WORTHS = [128, 64, 32, 16, 8, 4, 2, 1] as const

/** The number the switches make: the sum of the worths of the switches that are on. */
export function bitsToNumber(bits: readonly boolean[]): number {
  return WORTHS.reduce((sum, worth, i) => (bits[i] ? sum + worth : sum), 0)
}

/** The eight switches, leftmost first, that make a whole number from 0 to 255. */
export function numberToBits(value: number): boolean[] {
  if (!Number.isInteger(value) || value < 0 || value > 255) {
    throw new RangeError(`${value} is not a whole number from 0 to 255`)
  }
  return WORTHS.map((worth) => (value & worth) !== 0)
}

/** The sum written out, such as `64 + 1 = 65`, or `All off: 0` when no switch is on. */
export function sumWords(bits: readonly boolean[]): string {
  const on = WORTHS.filter((_, i) => bits[i])
  if (on.length === 0) return 'All off: 0'
  if (on.length === 1) return `Only the ${on[0]} switch is on: ${on[0]}`
  return `${on.join(' + ')} = ${bitsToNumber(bits)}`
}

/** The ASCII character for a code from 32 to 126, or null for any other number. */
export function letterFor(code: number): string | null {
  return Number.isInteger(code) && code >= 32 && code <= 126 ? String.fromCharCode(code) : null
}

/** The letter line, such as `As a letter: A`. */
export function letterWords(code: number): string {
  if (code === 32) return 'As a letter: a space'
  return `As a letter: ${letterFor(code) ?? '(none)'}`
}
