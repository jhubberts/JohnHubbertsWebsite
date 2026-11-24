import {
  FLOWERS,
  MACHINE,
  MEAN,
  countRight,
  flowerOrder,
  otherSpecies,
  toPlotLine,
  valueAt,
  type Flower,
  type Line,
} from './flowers'

/** The numbers of wrong labels the reader can choose from. */
export const WRONG_LABEL_COUNTS = [0, 5, 20, 50] as const
export type WrongLabelCount = (typeof WRONG_LABEL_COUNTS)[number]

/**
 * Seed of the fixed shuffle that decides which flowers get a wrong label. The first n flowers of
 * this shuffle are the ones swapped, so the 5 are inside the 20, and the 20 inside the 50.
 */
export const SWAP_SEED = 5

/** Passes over all 100 flowers the machine makes before it stops, when no line gets them all. */
export const PASSES = 50

const swapOrder = flowerOrder(SWAP_SEED)

/** Indexes, into FLOWERS, of the flowers whose label is swapped, in increasing order. */
export function swappedFlowers(count: number): number[] {
  return swapOrder.slice(0, count).sort((a, b) => a - b)
}

/** The 100 flowers with the given flowers' species swapped to the other one. */
export function labeledFlowers(swapped: number[]): Flower[] {
  const set = new Set(swapped)
  return FLOWERS.map((flower, i) =>
    set.has(i) ? { ...flower, species: otherSpecies(flower.species) } : flower,
  )
}

export interface Learned {
  /** The line the machine keeps, in centimeters, versicolor on its positive side. */
  line: Line
  /** Flowers on the side their label says. */
  rightByLabels: number
  /** Flowers on the side their real species says. */
  rightBySpecies: number
}

/**
 * Chapter 3's machine, the same rule, start line, step and checking order, run on `labeled`
 * instead of the real species. With wrong labels a straight line may be unable to put every flower
 * on its labeled side, and then the machine would correct forever. So it makes at most PASSES
 * passes over the flowers and keeps the best line it has seen: after each correction, the line is
 * kept if it gets more labeled flowers right than any line before it (the "pocket" rule; the start
 * line counts, and the earlier line wins a tie). It stops early once every flower is on its labeled
 * side, which with no wrong labels gives chapter 3's final line.
 */
export function learnFromLabels(labeled: Flower[]): Learned {
  const centred = labeled.map((flower) => ({ x: flower.x - MEAN.x, y: flower.y - MEAN.y }))
  const isRightAt = (line: Line, i: number) => {
    const value = valueAt(line, centred[i])
    return labeled[i].species === 'versicolor' ? value > 0 : value < 0
  }
  const rightCount = (line: Line) => labeled.filter((_, i) => isRightAt(line, i)).length

  const order = flowerOrder(MACHINE.seed)
  let line: Line = { ...MACHINE.start }
  let pocket = line
  let pocketRight = rightCount(line)
  for (let pass = 0; pass < PASSES && pocketRight < labeled.length; pass++) {
    for (const i of order) {
      if (isRightAt(line, i)) continue
      const move = MACHINE.step * (labeled[i].species === 'versicolor' ? 1 : -1)
      line = {
        a: line.a + move * centred[i].x,
        b: line.b + move * centred[i].y,
        c: line.c + move,
      }
      const right = rightCount(line)
      if (right > pocketRight) {
        pocket = line
        pocketRight = right
        if (right === labeled.length) break
      }
    }
  }

  const plotLine = toPlotLine(pocket)
  return {
    line: plotLine,
    rightByLabels: countRight(plotLine, labeled),
    rightBySpecies: countRight(plotLine, FLOWERS),
  }
}
