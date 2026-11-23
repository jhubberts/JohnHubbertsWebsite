import iris from './iris.json'

/** The two iris species the chapter plots. */
export type Species = 'setosa' | 'versicolor'

/** One flower, placed by the two measurements the plot uses, in centimetres. */
export interface Flower {
  species: Species
  x: number
  y: number
}

export interface Point {
  x: number
  y: number
}

/**
 * A straight line as three numbers: a point (x, y) is on its positive side when a·x + b·y + c > 0,
 * on its negative side when that is below 0, and on the line when it is 0.
 */
export interface Line {
  a: number
  b: number
  c: number
}

/** The area the plot shows, in centimetres. */
export interface Rect {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
}

/**
 * The measurements plotted. Sepal length against sepal width separates setosa from versicolor
 * with a straight line, though only narrowly (the widest gap a line can leave is about 0.24 cm),
 * so it is used rather than the petal pair, which separates easily.
 */
export const X_MEASUREMENT = 'sepalLength'
export const Y_MEASUREMENT = 'sepalWidth'
/** The axis words the reader sees, before "in centimetres". */
export const X_WORDS = 'Sepal length'
export const Y_WORDS = 'Sepal width'

/** The 100 setosa and versicolor flowers, in the data file's order. */
export const FLOWERS: Flower[] = iris.flowers.map((flower) => ({
  species: flower.species as Species,
  x: flower[X_MEASUREMENT],
  y: flower[Y_MEASUREMENT],
}))

/** The plotted area: the data spans 4.3 to 7.0 cm across and 2.0 to 4.4 cm up. */
export const PLOT: Rect = { xMin: 4, xMax: 7.3, yMin: 1.8, yMax: 4.6 }
export const X_TICKS = [4, 5, 6, 7]
export const Y_TICKS = [2, 2.5, 3, 3.5, 4, 4.5]

/** Where the reader's two handles start: an upright line at 5.5 cm that gets 84 of 100 right. */
export const READER_START: [Point, Point] = [
  { x: 5.5, y: 1.95 },
  { x: 5.5, y: 4.45 },
]

/** Keeps a point inside a rectangle. */
export function clampToRect(point: Point, rect: Rect): Point {
  return {
    x: Math.min(rect.xMax, Math.max(rect.xMin, point.x)),
    y: Math.min(rect.yMax, Math.max(rect.yMin, point.y)),
  }
}

export function valueAt(line: Line, point: Point): number {
  return line.a * point.x + line.b * point.y + line.c
}

/**
 * Whether a flower is on the side assigned to its species. `positive` is the species the positive
 * side is assigned to; the negative side gets the other one. A flower on the line is on neither.
 */
export function isRight(line: Line, flower: Flower, positive: Species = 'versicolor'): boolean {
  const value = valueAt(line, flower)
  return flower.species === positive ? value > 0 : value < 0
}

export function countRight(
  line: Line,
  flowers: Flower[],
  positive: Species = 'versicolor',
): number {
  return flowers.filter((flower) => isRight(line, flower, positive)).length
}

/** Indexes, into `flowers`, of the flowers not on their species' side. */
export function wrongOnes(
  line: Line,
  flowers: Flower[],
  positive: Species = 'versicolor',
): number[] {
  const wrong: number[] = []
  flowers.forEach((flower, i) => {
    if (!isRight(line, flower, positive)) wrong.push(i)
  })
  return wrong
}

/**
 * The species to assign to the line's positive side for the reader's line: whichever of the two
 * ways of assigning sides gets more flowers right (versicolor on a tie).
 */
export function bestAssignment(line: Line, flowers: Flower[]): Species {
  return countRight(line, flowers, 'setosa') > countRight(line, flowers, 'versicolor')
    ? 'setosa'
    : 'versicolor'
}

export function otherSpecies(species: Species): Species {
  return species === 'setosa' ? 'versicolor' : 'setosa'
}

/** The line through two points; all three numbers are 0 when the points are the same. */
export function lineThrough(p: Point, q: Point): Line {
  const a = q.y - p.y
  const b = p.x - q.x
  return { a, b, c: -(a * p.x + b * p.y) }
}

/**
 * The two points where a line enters and leaves a rectangle, or null when it misses it or only
 * touches a corner.
 */
export function clipToRect(line: Line, rect: Rect): [Point, Point] | null {
  const found: Point[] = []
  const add = (point: Point) => {
    if (found.every((other) => Math.hypot(other.x - point.x, other.y - point.y) > 1e-9)) {
      found.push(point)
    }
  }
  if (line.b !== 0) {
    for (const x of [rect.xMin, rect.xMax]) {
      const y = -(line.a * x + line.c) / line.b
      if (y >= rect.yMin && y <= rect.yMax) add({ x, y })
    }
  }
  if (line.a !== 0) {
    for (const y of [rect.yMin, rect.yMax]) {
      const x = -(line.b * y + line.c) / line.a
      if (x >= rect.xMin && x <= rect.xMax) add({ x, y })
    }
  }
  return found.length >= 2 ? [found[0], found[1]] : null
}

/** Whether a line passes through the inside of a rectangle. */
export function crossesRect(line: Line, rect: Rect): boolean {
  return clipToRect(line, rect) !== null
}

/** The part of a rectangle on one side of a line, as polygon corners; empty if there is none. */
export function sideOfRect(line: Line, rect: Rect, positive: boolean): Point[] {
  const corners: Point[] = [
    { x: rect.xMin, y: rect.yMin },
    { x: rect.xMax, y: rect.yMin },
    { x: rect.xMax, y: rect.yMax },
    { x: rect.xMin, y: rect.yMax },
  ]
  const signed = (point: Point) => (positive ? 1 : -1) * valueAt(line, point)
  const polygon: Point[] = []
  corners.forEach((point, i) => {
    const next = corners[(i + 1) % corners.length]
    const here = signed(point)
    const there = signed(next)
    if (here >= 0) polygon.push(point)
    if ((here > 0 && there < 0) || (here < 0 && there > 0)) {
      const share = here / (here - there)
      polygon.push({
        x: point.x + share * (next.x - point.x),
        y: point.y + share * (next.y - point.y),
      })
    }
  })
  return polygon
}

// The machine ------------------------------------------------------------------------------------

/** The mean of the 100 flowers' measurements; the machine works on measurements less this. */
export const MEAN: Point = {
  x: FLOWERS.reduce((sum, flower) => sum + flower.x, 0) / FLOWERS.length,
  y: FLOWERS.reduce((sum, flower) => sum + flower.y, 0) / FLOWERS.length,
}

/** The machine's three numbers act on centred measurements; this is the same line in centimetres. */
export function toPlotLine(centred: Line): Line {
  return { a: centred.a, b: centred.b, c: centred.c - centred.a * MEAN.x - centred.b * MEAN.y }
}

export interface MachineSettings {
  /** The machine's first line, in centred measurements. */
  start: Line
  /** How far one correction moves the three numbers. */
  step: number
  /** Seed of the fixed order the machine checks the flowers in. */
  seed: number
}

/**
 * Chosen by trying start lines, steps and seeds: from a level line through the middle of the data
 * (16 of 100 right) the machine finishes after 27 corrections, every line along the way crosses the
 * plot, and each correction moves its flower closer to its side.
 */
export const MACHINE: MachineSettings = {
  start: { a: 0, b: 1, c: 0 },
  step: 0.1,
  seed: 8,
}

/** How many corrections the machine needs with MACHINE. */
export const MACHINE_CORRECTIONS = 27

export interface MachineState {
  /** The current line, in centred measurements. */
  line: Line
  /** Position in the checking order of the next flower to check. */
  position: number
  corrections: number
  /** True once a full pass finds no flower on the wrong side. */
  done: boolean
}

export interface Correction {
  state: MachineState
  /** Index into FLOWERS of the flower that caused this correction, or null when none did. */
  flower: number | null
  done: boolean
}

/** A small seeded random number generator (mulberry32), giving numbers from 0 up to 1. */
function random(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** The fixed order, a shuffle of 0 to 99 by `seed`, in which the machine checks the flowers. */
export function flowerOrder(seed: number): number[] {
  const order = FLOWERS.map((_, i) => i)
  const next = random(seed)
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return order
}

const centred: Point[] = FLOWERS.map((flower) => ({ x: flower.x - MEAN.x, y: flower.y - MEAN.y }))

function isCentredRight(line: Line, i: number): boolean {
  const value = valueAt(line, centred[i])
  return FLOWERS[i].species === 'versicolor' ? value > 0 : value < 0
}

export function machineStart(settings: MachineSettings = MACHINE): MachineState {
  const line = { ...settings.start }
  return {
    line,
    position: 0,
    corrections: 0,
    done: FLOWERS.every((_, i) => isCentredRight(line, i)),
  }
}

/**
 * Checks flowers in the fixed order from where the machine left off. At the first one on the wrong
 * side it moves the line: a += r·t·x', b += r·t·y', c += r·t, where t is +1 for versicolor and −1
 * for setosa and x', y' are its centred measurements. `done` is true when, after that, a full pass
 * would find no flower on the wrong side.
 */
export function nextCorrection(
  state: MachineState,
  settings: MachineSettings = MACHINE,
): Correction {
  if (state.done) return { state, flower: null, done: true }
  const order = orderFor(settings.seed)
  const count = order.length
  for (let k = 0; k < count; k++) {
    const position = (state.position + k) % count
    const i = order[position]
    if (isCentredRight(state.line, i)) continue
    const t = FLOWERS[i].species === 'versicolor' ? 1 : -1
    const move = settings.step * t
    const line = {
      a: state.line.a + move * centred[i].x,
      b: state.line.b + move * centred[i].y,
      c: state.line.c + move,
    }
    const done = FLOWERS.every((_, j) => isCentredRight(line, j))
    const next = {
      line,
      position: (position + 1) % count,
      corrections: state.corrections + 1,
      done,
    }
    return { state: next, flower: i, done }
  }
  return { state: { ...state, done: true }, flower: null, done: true }
}

const orders = new Map<number, number[]>()
function orderFor(seed: number): number[] {
  let order = orders.get(seed)
  if (!order) {
    order = flowerOrder(seed)
    orders.set(seed, order)
  }
  return order
}

/** Runs the machine to the end, or until `limit` corrections; returns every state, start first. */
export function runMachine(settings: MachineSettings = MACHINE, limit = 100_000): MachineState[] {
  const states = [machineStart(settings)]
  while (!states[states.length - 1].done && states.length <= limit) {
    states.push(nextCorrection(states[states.length - 1], settings).state)
  }
  return states
}
