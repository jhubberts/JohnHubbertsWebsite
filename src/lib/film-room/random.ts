/**
 * A seeded random number generator, so the same seed always builds the same play. A play's seed
 * goes in the page address, which lets a play be reopened or sent to someone.
 */

export interface Random {
  /** A number in [0, 1). */
  next(): number
  /** True with probability `p`. */
  chance(p: number): boolean
  /** One item, each equally likely. */
  pick<T>(items: readonly T[]): T
  /**
   * One item, chosen in proportion to its weight. Items with weight 0 are never chosen. Throws
   * when no item has a positive weight.
   */
  weighted<T>(items: readonly (readonly [T, number])[]): T
  /** A whole number from `low` to `high`, inclusive. */
  int(low: number, high: number): number
}

/**
 * A generator for `seed`, using the Mulberry32 algorithm: 32 bits of state and a few integer
 * operations per number.
 */
export function createRandom(seed: number): Random {
  let state = seed >>> 0
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return {
    next,
    chance: (p) => next() < p,
    pick: (items) => items[Math.floor(next() * items.length)],
    weighted: (items) => {
      const total = items.reduce((sum, [, weight]) => sum + weight, 0)
      let roll = next() * total
      for (const [item, weight] of items) {
        if (weight <= 0) continue
        if (roll < weight) return item
        roll -= weight
      }
      // Floating-point rounding can leave `roll` just above the last weight; that roll belongs
      // to the last item with a positive weight.
      const last = [...items].reverse().find(([, weight]) => weight > 0)
      if (!last) throw new Error('weighted() needs at least one item with a positive weight')
      return last[0]
    },
    int: (low, high) => low + Math.floor(next() * (high - low + 1)),
  }
}

/** A new seed for a play, from `Math.random()`. */
export function newSeed(): number {
  return Math.floor(Math.random() * 2 ** 31)
}
