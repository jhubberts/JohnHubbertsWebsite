import { describe, expect, it } from 'vitest'
import iris from './iris.json'
import {
  FLOWERS,
  MACHINE,
  MACHINE_CORRECTIONS,
  PLOT,
  READER_START,
  bestAssignment,
  clipToRect,
  countRight,
  crossesRect,
  flowerOrder,
  lineThrough,
  machineStart,
  nextCorrection,
  runMachine,
  sideOfRect,
  toPlotLine,
  wrongOnes,
  type Flower,
  type Line,
} from './flowers'

/** The widest-gap line for sepal length (x) against sepal width (y), found by trying angles. */
const SEPARATING: Line = { a: 0.7682, b: -0.6402, c: -2.1058 }

describe('iris.json', () => {
  it('holds 50 setosa then 50 versicolor flowers from the corrected UCI file', () => {
    expect(iris.source).toBe(
      'https://archive.ics.uci.edu/ml/machine-learning-databases/iris/bezdekIris.data',
    )
    expect(iris.flowers).toHaveLength(100)
    expect(iris.flowers.filter((f) => f.species === 'setosa')).toHaveLength(50)
    expect(iris.flowers.filter((f) => f.species === 'versicolor')).toHaveLength(50)
    expect(iris.flowers[0]).toEqual({
      species: 'setosa',
      sepalLength: 5.1,
      sepalWidth: 3.5,
      petalLength: 1.4,
      petalWidth: 0.2,
    })
    // Rows 35 and 38 are the two the corrected file fixes.
    expect(iris.flowers[34]).toMatchObject({ sepalLength: 4.9, sepalWidth: 3.1, petalLength: 1.5 })
    expect(iris.flowers[37]).toMatchObject({ sepalLength: 4.9, sepalWidth: 3.6, petalWidth: 0.1 })
  })

  it('fits inside the plotted area', () => {
    for (const flower of FLOWERS) {
      expect(flower.x).toBeGreaterThan(PLOT.xMin)
      expect(flower.x).toBeLessThan(PLOT.xMax)
      expect(flower.y).toBeGreaterThan(PLOT.yMin)
      expect(flower.y).toBeLessThan(PLOT.yMax)
    }
  })
})

describe('countRight and wrongOnes', () => {
  const handMade: Flower[] = [
    { species: 'versicolor', x: 2, y: 0 },
    { species: 'versicolor', x: -1, y: 0 },
    { species: 'setosa', x: -2, y: 0 },
    { species: 'setosa', x: 0, y: 0 },
  ]
  // x > 0 is the positive side; the last flower is on the line, so on neither side.
  const upright: Line = { a: 1, b: 0, c: 0 }

  it('counts flowers on their species side', () => {
    expect(countRight(upright, handMade)).toBe(2)
    expect(wrongOnes(upright, handMade)).toEqual([1, 3])
  })

  it('counts the other way when the positive side is given to setosa', () => {
    expect(countRight(upright, handMade, 'setosa')).toBe(1)
  })
})

describe('bestAssignment', () => {
  it('gives the positive side to whichever species gets more right', () => {
    const line: Line = { a: 1, b: 0, c: -5.5 }
    expect(bestAssignment(line, FLOWERS)).toBe('versicolor')
    const flipped: Line = { a: -1, b: 0, c: 5.5 }
    expect(bestAssignment(flipped, FLOWERS)).toBe('setosa')
    expect(countRight(flipped, FLOWERS, 'setosa')).toBe(countRight(line, FLOWERS))
  })

  it('starts the reader with clearly fewer than 100 right but more than half', () => {
    const line = lineThrough(...READER_START)
    expect(countRight(line, FLOWERS, bestAssignment(line, FLOWERS))).toBe(84)
  })
})

describe('sepal length against sepal width', () => {
  it('is separated by a known line, and a level line through the middle gets 16 right', () => {
    expect(countRight(SEPARATING, FLOWERS)).toBe(100)
    expect(countRight({ a: 0, b: 1, c: -3.099 }, FLOWERS)).toBe(16)
  })
})

describe('the machine', () => {
  const states = runMachine()
  const last = states[states.length - 1]

  it(`finishes after ${MACHINE_CORRECTIONS} corrections, the same on every run`, () => {
    expect(last.done).toBe(true)
    expect(last.corrections).toBe(MACHINE_CORRECTIONS)
    expect(runMachine()).toEqual(states)
  })

  it('ends with a line that gets all 100 right', () => {
    expect(countRight(toPlotLine(last.line), FLOWERS)).toBe(100)
  })

  it('starts clearly wrong, and every line along the way crosses the plot', () => {
    expect(countRight(toPlotLine(states[0].line), FLOWERS)).toBe(16)
    for (const state of states) expect(crossesRect(toPlotLine(state.line), PLOT)).toBe(true)
  })

  it('moves the line by the rule, for the flower that was on the wrong side', () => {
    const start = machineStart()
    const first = nextCorrection(start)
    const flower = FLOWERS[first.flower!]
    expect(wrongOnes(toPlotLine(start.line), FLOWERS)).toContain(first.flower)
    const t = flower.species === 'versicolor' ? 1 : -1
    const meanX = FLOWERS.reduce((sum, f) => sum + f.x, 0) / 100
    const meanY = FLOWERS.reduce((sum, f) => sum + f.y, 0) / 100
    expect(first.state.line.a).toBeCloseTo(MACHINE.step * t * (flower.x - meanX), 12)
    expect(first.state.line.b).toBeCloseTo(1 + MACHINE.step * t * (flower.y - meanY), 12)
    expect(first.state.line.c).toBeCloseTo(MACHINE.step * t, 12)
  })

  it('makes no correction once done', () => {
    expect(nextCorrection(last)).toEqual({ state: last, flower: null, done: true })
  })

  it('checks the two species in an irregular mix', () => {
    const order = flowerOrder(MACHINE.seed)
    expect([...order].sort((a, b) => a - b)).toEqual(FLOWERS.map((_, i) => i))
    const firstTwenty = order.slice(0, 20).map((i) => FLOWERS[i].species)
    expect(firstTwenty.filter((s) => s === 'setosa').length).toBeGreaterThan(3)
    expect(firstTwenty.filter((s) => s === 'versicolor').length).toBeGreaterThan(3)
  })
})

describe('plot geometry', () => {
  it('clips a line to the rectangle it crosses and misses one it does not', () => {
    expect(clipToRect({ a: 1, b: 0, c: -5 }, PLOT)).toEqual([
      { x: 5, y: PLOT.yMin },
      { x: 5, y: PLOT.yMax },
    ])
    expect(clipToRect({ a: 1, b: 0, c: -10 }, PLOT)).toBeNull()
  })

  it('splits the rectangle into the two sides of a line', () => {
    const line: Line = { a: 1, b: 0, c: -5 }
    expect(sideOfRect(line, PLOT, true)).toEqual([
      { x: 5, y: PLOT.yMin },
      { x: PLOT.xMax, y: PLOT.yMin },
      { x: PLOT.xMax, y: PLOT.yMax },
      { x: 5, y: PLOT.yMax },
    ])
    expect(sideOfRect(line, PLOT, false)).toHaveLength(4)
  })
})
