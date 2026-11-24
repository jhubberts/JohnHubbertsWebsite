/** A bead's kind: water-avoiding beads are drawn filled, water-loving beads hollow. */
export type Bead = 'avoiding' | 'loving'

export interface Point {
  x: number
  y: number
}

/** The drawing's size, in SVG units. */
export const VIEW = { width: 360, height: 260 }
const CENTRE: Point = { x: VIEW.width / 2, y: VIEW.height / 2 }

/**
 * The folded shape, as cells of a honeycomb, each touching six others. A cell is (q, r): q steps
 * to the right and r steps down and to the right of the middle cell. The shape is the middle cell,
 * the 6 cells around it, the 12 around those, and 5 cells of the next ring along the bottom: a
 * filled ball. The chain runs over the outside, steps in to cover the middle seven cells, steps
 * out, and covers the rest. Each link joins two touching cells, so every link is one cell long and,
 * on a honeycomb, no two links can cross.
 */
const FOLDED_CELLS: [number, number][] = [
  [-2, 0],
  [-1, -1],
  [0, -2],
  [1, -2],
  [2, -2],
  [2, -1],
  [2, 0],
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, 0],
  [0, 0],
  [-1, 1],
  [0, 1],
  [-1, 2],
  [0, 2],
  [1, 2],
  [0, 3],
  [-1, 3],
  [-2, 3],
  [-3, 3],
  [-2, 2],
  [-2, 1],
]

/** How many honeycomb steps a cell is from the middle cell. */
function ring([q, r]: [number, number]): number {
  return (Math.abs(q) + Math.abs(r) + Math.abs(q + r)) / 2
}

/**
 * The 24 beads in chain order: the middle cell and the six around it are water-avoiding, so the
 * chain is 8 water-loving beads, 7 water-avoiding, then 9 water-loving.
 */
export const SEQUENCE: Bead[] = FOLDED_CELLS.map((cell) =>
  ring(cell) <= 1 ? 'avoiding' : 'loving',
)

/** Distance between the middles of touching cells in the folded shape, in SVG units. */
const CELL = 22

/** The folded shape, its middle cell at the middle of the drawing. */
export const FOLDED: Point[] = FOLDED_CELLS.map(([q, r]) => ({
  x: CENTRE.x + (q + r / 2) * CELL,
  y: CENTRE.y + ((r * Math.sqrt(3)) / 2) * CELL,
}))

/** The start: the chain laid out left to right as a gentle wave of one and a half periods. */
export const UNFOLDED: Point[] = SEQUENCE.map((_, i) => {
  const share = i / (SEQUENCE.length - 1)
  return {
    x: 24 + share * (VIEW.width - 48),
    y: CENTRE.y + 34 * Math.sin(share * 3 * Math.PI),
  }
})

/** Slow at both ends, fastest in the middle. */
export function ease(t: number): number {
  const clamped = Math.min(1, Math.max(0, t))
  return clamped < 0.5 ? 4 * clamped ** 3 : 1 - (-2 * clamped + 2) ** 3 / 2
}

/** Each bead's position `t` of the way (0 to 1, eased) from the unfolded to the folded shape. */
export function positionsAt(t: number): Point[] {
  const e = ease(t)
  return UNFOLDED.map((start, i) => ({
    x: start.x + (FOLDED[i].x - start.x) * e,
    y: start.y + (FOLDED[i].y - start.y) * e,
  }))
}

/** The length of each link, from bead 0 to bead 1 first. */
export function linkLengths(points: Point[]): number[] {
  return points.slice(1).map((point, i) => Math.hypot(point.x - points[i].x, point.y - points[i].y))
}

function cross(o: Point, p: Point, q: Point): number {
  return (p.x - o.x) * (q.y - o.y) - (p.y - o.y) * (q.x - o.x)
}

/** Whether segments pq and rs cross, each passing from one side of the other to its other side. */
export function segmentsCross(p: Point, q: Point, r: Point, s: Point): boolean {
  const d1 = cross(r, s, p)
  const d2 = cross(r, s, q)
  const d3 = cross(p, q, r)
  const d4 = cross(p, q, s)
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))
}

/** Pairs of link indexes, links that share no bead, that cross. */
export function crossingLinks(points: Point[]): [number, number][] {
  const found: [number, number][] = []
  for (let i = 0; i < points.length - 1; i++) {
    for (let j = i + 2; j < points.length - 1; j++) {
      if (segmentsCross(points[i], points[i + 1], points[j], points[j + 1])) found.push([i, j])
    }
  }
  return found
}

/** A bead's distance from the middle of the drawing. */
export function distanceFromCentre(point: Point): number {
  return Math.hypot(point.x - CENTRE.x, point.y - CENTRE.y)
}
