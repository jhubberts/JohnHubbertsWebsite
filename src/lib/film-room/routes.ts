/**
 * Pass routes and the pass concepts that combine them. A route is drawn in "out" and "down"
 * yards from where the receiver starts: positive "out" is toward his own sideline, so the same
 * route works on either side of the field.
 */

import type { Point, Side } from './field'
import type { CoverageId } from './defense'
import { receiversOnSide, type Formation, type OffenseId, type ReceiverCount } from './offense'

export type RouteId =
  | 'go'
  | 'fade'
  | 'seam'
  | 'post'
  | 'corner'
  | 'dig'
  | 'out'
  | 'sail'
  | 'quickOut'
  | 'hitch'
  | 'curl'
  | 'slant'
  | 'flat'
  | 'wheel'
  | 'drag'
  | 'shallow'
  | 'cross'
  | 'stick'
  | 'swing'
  | 'checkFlat'
  | 'block'

interface RouteShape {
  name: string
  /** Turning points as [out, down] yards from the receiver's spot at the snap. */
  points: [number, number][]
  /** Seconds the receiver waits before he starts, for a back who checks for a blitzer first. */
  delay?: number
}

export const ROUTES: Record<RouteId, RouteShape> = {
  go: {
    name: 'Go',
    points: [
      [0, 3],
      [0.5, 26],
    ],
  },
  fade: {
    name: 'Fade',
    points: [
      [1.5, 8],
      [3, 26],
    ],
  },
  seam: {
    name: 'Seam',
    points: [
      [0, 4],
      [-1, 26],
    ],
  },
  post: {
    name: 'Post',
    points: [
      [0, 12],
      [-7, 25],
    ],
  },
  corner: {
    name: 'Corner',
    points: [
      [0, 11],
      [7, 20],
    ],
  },
  dig: {
    name: 'Dig',
    points: [
      [0, 13],
      [-1, 14],
      [-15, 14],
    ],
  },
  out: {
    name: 'Out',
    points: [
      [0, 10],
      [8, 10],
    ],
  },
  sail: {
    name: 'Sail',
    points: [
      [0, 6],
      [3, 12],
      [11, 14],
    ],
  },
  quickOut: {
    name: 'Quick out',
    points: [
      [0, 5],
      [7, 5],
    ],
  },
  hitch: {
    name: 'Hitch',
    points: [
      [0, 6],
      [-0.3, 4.8],
    ],
  },
  curl: {
    name: 'Curl',
    points: [
      [0, 12],
      [-1.5, 10.5],
    ],
  },
  slant: {
    name: 'Slant',
    points: [
      [0, 1.5],
      [-12, 10],
    ],
  },
  flat: {
    name: 'Flat',
    points: [
      [2.5, 1],
      [9, 3],
    ],
  },
  wheel: {
    name: 'Wheel',
    points: [
      [3, 1],
      [7, 4],
      [7.5, 26],
    ],
  },
  drag: {
    name: 'Drag',
    points: [
      [-2, 3],
      [-22, 5],
    ],
  },
  shallow: {
    name: 'Shallow cross',
    points: [
      [-2, 4],
      [-22, 6.5],
    ],
  },
  cross: {
    name: 'Deep cross',
    points: [
      [0, 8],
      [-24, 16],
    ],
  },
  stick: {
    name: 'Stick',
    points: [
      [0, 6],
      [-0.8, 5.6],
    ],
  },
  swing: {
    name: 'Swing',
    points: [
      [2.5, -1],
      [8, 0.5],
      [10, 2],
    ],
  },
  checkFlat: {
    name: 'Check, then flat',
    points: [
      [3, 1],
      [8, 3],
    ],
    delay: 0.9,
  },
  block: { name: 'Pass protection', points: [[0.3, -0.6]] },
}

/** The route's path in field yards, starting at the receiver's spot. `side` is his "out" side. */
export function routePath(route: RouteId, start: Point, side: Side): Point[] {
  return [
    start,
    ...ROUTES[route].points.map(([out, down]) => ({ x: start.x + out * side, y: start.y + down })),
  ]
}

export type ConceptId =
  | 'fourVerts'
  | 'smash'
  | 'mesh'
  | 'flood'
  | 'yCross'
  | 'dagger'
  | 'stick'
  | 'slantFlat'
  | 'drive'

/** One pass-catcher's place in the formation. A concept picks his route from it. */
export interface RouteSlot {
  /** Whether he is on the formation's strong side; for a back, the side he releases to. */
  strong: boolean
  /** Counted from the outside in; 0 for a back in the backfield. */
  number: number
  /** How many pass-catchers are counted on his side, leaving out backs in the backfield. */
  onSide: number
}

interface ConceptDef {
  name: string
  /** What the play is built to do, in a sentence or two. */
  idea: string
  /** The coverages it is drawn up to beat. */
  beats: CoverageId[]
  /** The side the tailback releases to when he runs a route. */
  backSide: 'strong' | 'weak'
  route(slot: RouteSlot): RouteId
}

/** True for the innermost receiver on his side. */
const innermost = (slot: RouteSlot) => slot.number === slot.onSide

export const CONCEPTS: Record<ConceptId, ConceptDef> = {
  fourVerts: {
    name: 'Four Verticals',
    idea: 'Four receivers run deep at once. Against one deep safety, two seam routes put him in a bind: he can only take one.',
    beats: ['cover3', 'cover1'],
    backSide: 'weak',
    route: (s) => (s.number === 0 ? 'checkFlat' : s.number === 1 ? 'fade' : 'seam'),
  },
  smash: {
    name: 'Smash',
    idea: 'A hitch underneath and a corner route over the top. The cornerback in the flat cannot cover both: if he sits on the hitch, the corner route is open behind him.',
    beats: ['cover2', 'tampa2'],
    backSide: 'weak',
    route: (s) =>
      s.number === 0 ? 'checkFlat' : s.number === 1 ? 'hitch' : s.number === 2 ? 'corner' : 'drag',
  },
  mesh: {
    name: 'Mesh',
    idea: 'Two shallow crossers run past each other at five or six yards. Man defenders chasing them run into each other, and someone comes open.',
    beats: ['cover1', 'cover0', 'twoMan'],
    backSide: 'weak',
    route: (s) => {
      if (s.number === 0) return 'swing'
      if (innermost(s)) return s.strong ? 'drag' : 'shallow'
      if (s.number === 1) return s.strong ? 'corner' : 'go'
      return 'stick'
    },
  },
  flood: {
    name: 'Flood (Sail)',
    idea: 'Three receivers to one side at three depths: deep, medium and short. In Cover 3 only two defenders are on that side, so one level is open.',
    beats: ['cover3', 'cover1'],
    backSide: 'strong',
    route: (s) => {
      if (s.number === 0) return 'flat'
      if (!s.strong) return s.number === 1 ? 'dig' : 'seam'
      return s.number === 1 ? 'go' : s.number === 2 ? 'sail' : 'flat'
    },
  },
  yCross: {
    name: 'Y-Cross',
    idea: 'The inside receiver runs a deep crossing route across the whole field, behind the linebackers and under the deep safety.',
    beats: ['cover3', 'cover1'],
    backSide: 'weak',
    route: (s) => {
      if (s.number === 0) return 'checkFlat'
      if (!s.strong) return s.number === 1 ? 'post' : 'curl'
      if (s.number === 1) return 'go'
      return innermost(s) ? 'cross' : 'flat'
    },
  },
  dagger: {
    name: 'Dagger',
    idea: 'The inside receiver runs a seam to pull the safety and the hook defender deep, and the outside receiver runs a dig into the space they leave.',
    beats: ['cover3', 'cover4'],
    backSide: 'weak',
    route: (s) => {
      if (s.number === 0) return 'checkFlat'
      if (!s.strong) return s.number === 1 ? 'curl' : 'hitch'
      return s.number === 1 ? 'dig' : s.number === 2 ? 'seam' : 'flat'
    },
  },
  stick: {
    name: 'Stick',
    idea: 'A quick throw: one receiver sits at six yards and another runs to the flat right next to him. The one defender over them has to choose.',
    beats: ['cover3', 'cover4', 'cover6'],
    backSide: 'strong',
    route: (s) => {
      if (s.number === 0) return s.onSide >= 3 ? 'block' : 'flat'
      if (!s.strong) return s.number === 1 ? 'slant' : 'quickOut'
      return s.number === 1 ? 'fade' : s.number === 2 ? 'stick' : 'flat'
    },
  },
  slantFlat: {
    name: 'Slant-Flat',
    idea: 'The outside receiver runs a slant and the inside receiver runs to the flat. The flat defender is high-lowed: if he takes the flat, the slant is open behind him.',
    beats: ['cover2', 'cover3'],
    backSide: 'weak',
    route: (s) =>
      s.number === 0 ? 'block' : s.number === 1 ? 'slant' : s.number === 2 ? 'flat' : 'seam',
  },
  drive: {
    name: 'Drive',
    idea: 'A shallow crosser at about five yards with a dig at fourteen over it. The hook linebacker cannot take both.',
    beats: ['cover1', 'cover3'],
    backSide: 'weak',
    route: (s) => {
      if (s.number === 0) return 'checkFlat'
      if (!s.strong) return s.number === 1 ? 'go' : 'curl'
      return s.number === 1 ? 'dig' : s.number === 2 ? 'drag' : 'seam'
    },
  },
}

export interface RouteAssignment {
  route: RouteId
  /** The side his route breaks "out" to. */
  side: Side
}

/** Every pass-catcher's route for a concept run from a formation. A fullback stays in to block. */
export function assignRoutes(
  concept: ConceptId,
  formation: Formation,
): Partial<Record<OffenseId, RouteAssignment>> {
  const def = CONCEPTS[concept]
  const strength = formation.strength
  const backSide: Side = def.backSide === 'strong' ? strength : (-strength as Side)
  const routes: Partial<Record<OffenseId, RouteAssignment>> = {}
  for (const [id, count] of Object.entries(formation.counts) as [OffenseId, ReceiverCount][]) {
    if (id === 'FB') {
      routes[id] = { route: 'block', side: count.side }
      continue
    }
    const side = count.number === 0 ? backSide : count.side
    const slot: RouteSlot = {
      strong: side === strength,
      number: count.number,
      onSide: receiversOnSide(formation, side),
    }
    routes[id] = { route: def.route(slot), side }
  }
  return routes
}

export const CONCEPT_IDS = Object.keys(CONCEPTS) as ConceptId[]
