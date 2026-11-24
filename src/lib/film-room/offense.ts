/**
 * Offensive formations: where the eleven offensive players line up, how the receivers are counted
 * from the outside in, and the pre-snap motions the Film Room can show.
 */

import { FIELD_WIDTH, type Point, type Side } from './field'

export type OffenseId = 'LT' | 'LG' | 'C' | 'RG' | 'RT' | 'QB' | 'RB' | 'FB' | 'X' | 'Z' | 'Y' | 'H'
export type OffenseRole = 'line' | 'qb' | 'back' | 'tightEnd' | 'receiver'
export type Personnel = '11' | '12' | '21'
export type FormationId =
  | 'doubles'
  | 'doublesTe'
  | 'trips'
  | 'trey'
  | 'bunch'
  | 'empty'
  | 'ace'
  | 'iPro'
export type MotionId = 'acrossToTrips' | 'backToEmpty'

export interface OffensivePlayer {
  id: OffenseId
  role: OffenseRole
  /** Where the player stands at the snap. */
  pos: Point
}

/** How a pass-catcher is counted, the way coaches and coverage rules count them. */
export interface ReceiverCount {
  side: Side
  /**
   * 1 is the widest receiver on that side, 2 the next one in, and so on. 0 is a back in the
   * backfield.
   */
  number: number
  /** A tight end lined up next to a tackle. */
  attached: boolean
}

export interface Formation {
  id: FormationId
  /** Which side the formation is strong to: the side with more receivers, or the tight end. */
  strength: Side
  ballX: number
  players: OffensivePlayer[]
  /** Pass-catchers only, keyed by player. */
  counts: Partial<Record<OffenseId, ReceiverCount>>
}

export interface Motion {
  id: MotionId
  player: OffenseId
  /** Where the player stands before the motion starts. */
  from: Point
}

const LINE: OffenseId[] = ['LT', 'LG', 'C', 'RG', 'RT']
/** Yards from one lineman to the next. */
const LINE_SPLIT = 1.3
/** The depth (`y`) of a player on the line of scrimmage, and of one a step behind it. */
const ON_LINE = -0.7
const OFF_LINE = -1.4

/** The spots a formation puts its pass-catchers and backs on, for one spot of the ball. */
interface Spots {
  wide(side: Side): Point
  slot(side: Side): Point
  innerSlot(side: Side): Point
  attached(side: Side): Point
  bunch(side: Side, part: 'point' | 'outside' | 'inside'): Point
  gunBack(side: Side): Point
  /** Straight behind the ball, `depth` yards deep, where under-center formations put backs. */
  behindBall(depth: number): Point
}

function spots(ballX: number): Spots {
  const tackle = (side: Side) => ballX + side * 2 * LINE_SPLIT
  const wideX = (side: Side) => (side < 0 ? 9 : FIELD_WIDTH - 9)
  const slotX = (side: Side) => (wideX(side) + tackle(side)) / 2 + side
  return {
    wide: (side) => ({ x: wideX(side), y: ON_LINE }),
    slot: (side) => ({ x: slotX(side), y: OFF_LINE }),
    innerSlot: (side) => ({ x: (slotX(side) + tackle(side)) / 2, y: OFF_LINE }),
    attached: (side) => ({ x: tackle(side) + side * LINE_SPLIT, y: ON_LINE }),
    bunch: (side, part) => {
      const point = tackle(side) + side * 6.5
      if (part === 'point') return { x: point, y: ON_LINE }
      return { x: point + (part === 'outside' ? side : -side) * 1.4, y: -1.9 }
    },
    gunBack: (side) => ({ x: ballX + side * 1.6, y: -5 }),
    behindBall: (depth) => ({ x: ballX, y: -depth }),
  }
}

export interface FormationDef {
  /** The name without a side, such as "Gun Trips". */
  name: string
  /** What the name means, for the glossary. */
  note: string
  personnel: Personnel
  underCenter: boolean
  /** Places the pass-catchers and backs for a formation strong to side `s` and weak to side `w`. */
  place(at: Spots, s: Side, w: Side): Partial<Record<OffenseId, Point>>
}

export const FORMATIONS: Record<FormationId, FormationDef> = {
  doubles: {
    name: 'Gun Doubles',
    note: 'Shotgun, two receivers on each side (2x2). The most common spread look in the NFL.',
    personnel: '11',
    underCenter: false,
    place: (at, s, w) => ({
      X: at.wide(w),
      H: at.slot(w),
      Y: at.slot(s),
      Z: at.wide(s),
      RB: at.gunBack(w),
    }),
  },
  doublesTe: {
    name: 'Gun Doubles Y-Tight',
    note: 'A 2x2 look with the tight end lined up next to the tackle on one side.',
    personnel: '11',
    underCenter: false,
    place: (at, s, w) => ({
      X: at.wide(w),
      H: at.slot(w),
      Y: at.attached(s),
      Z: { ...at.wide(s), y: OFF_LINE },
      RB: at.gunBack(s),
    }),
  },
  trips: {
    name: 'Gun Trips',
    note: 'Three receivers to one side (3x1), one receiver alone on the other side.',
    personnel: '11',
    underCenter: false,
    place: (at, s, w) => ({
      X: at.wide(w),
      Z: at.wide(s),
      H: at.slot(s),
      Y: at.innerSlot(s),
      RB: at.gunBack(w),
    }),
  },
  trey: {
    name: 'Gun Trey',
    note: 'Trips with the tight end attached as the third, innermost receiver.',
    personnel: '11',
    underCenter: false,
    place: (at, s, w) => ({
      X: at.wide(w),
      Z: { ...at.wide(s), y: OFF_LINE },
      H: at.slot(s),
      Y: at.attached(s),
      RB: at.gunBack(w),
    }),
  },
  bunch: {
    name: 'Gun Bunch',
    note: 'Three receivers packed together in a triangle, so defenders get picked in traffic.',
    personnel: '11',
    underCenter: false,
    place: (at, s, w) => ({
      X: at.wide(w),
      Z: at.bunch(s, 'outside'),
      H: at.bunch(s, 'point'),
      Y: at.bunch(s, 'inside'),
      RB: at.gunBack(w),
    }),
  },
  empty: {
    name: 'Gun Empty',
    note: 'No back next to the quarterback: three receivers on one side and two on the other (3x2).',
    personnel: '11',
    underCenter: false,
    place: (at, s, w) => ({
      X: at.wide(w),
      H: at.slot(w),
      Z: at.wide(s),
      Y: at.slot(s),
      RB: at.innerSlot(s),
    }),
  },
  ace: {
    name: 'Singleback Ace',
    note: 'Quarterback under center, one back, a tight end attached on each side (12 personnel).',
    personnel: '12',
    underCenter: true,
    place: (at, s, w) => ({
      // Both receivers stand off the line so the two tight ends are the ends of the line and
      // stay eligible.
      X: { ...at.wide(w), y: OFF_LINE },
      H: at.attached(w),
      Y: at.attached(s),
      Z: { ...at.wide(s), y: OFF_LINE },
      RB: at.behindBall(7),
    }),
  },
  iPro: {
    name: 'I-Formation Pro',
    note: 'Under center with a fullback and a tailback stacked behind him, tight end to one side (21 personnel).',
    personnel: '21',
    underCenter: true,
    place: (at, s, w) => ({
      X: at.wide(w),
      Y: at.attached(s),
      Z: { ...at.wide(s), y: OFF_LINE },
      FB: at.behindBall(4.5),
      RB: at.behindBall(7),
    }),
  },
}

/** The player who moves in each motion, and his starting spot on the formation's weak side. */
const MOTIONS: Record<MotionId, { player: OffenseId; from(at: Spots, weak: Side): Point }> = {
  acrossToTrips: { player: 'Y', from: (at, weak) => at.slot(weak) },
  backToEmpty: { player: 'RB', from: (at, weak) => at.gunBack(weak) },
}

export const MOTION_NAMES: Record<MotionId, string> = {
  acrossToTrips: 'Y motions across the formation: 2x2 becomes trips',
  backToEmpty: 'The back motions out of the backfield: the formation becomes empty',
}

const SPOT_NAMES: Record<OffenseId, string> = {
  QB: 'Quarterback',
  RB: 'Running back',
  FB: 'Fullback',
  LT: 'Left tackle',
  LG: 'Left guard',
  C: 'Center',
  RG: 'Right guard',
  RT: 'Right tackle',
  X: 'X receiver (split end, on the line)',
  Z: 'Z receiver (flanker, off the line)',
  Y: 'Y',
  H: 'H',
}

/** What a spot is called, such as "Z receiver (flanker, off the line)" or "Y: tight end". */
export function spotName(player: OffensivePlayer): string {
  if (player.id !== 'Y' && player.id !== 'H') return SPOT_NAMES[player.id]
  return `${player.id}: ${player.role === 'tightEnd' ? 'tight end' : 'slot receiver'}`
}

function roleOf(id: OffenseId, personnel: Personnel): OffenseRole {
  if (LINE.includes(id)) return 'line'
  if (id === 'QB') return 'qb'
  if (id === 'RB' || id === 'FB') return 'back'
  if (id === 'Y' || (id === 'H' && personnel === '12')) return 'tightEnd'
  return 'receiver'
}

/** Builds a formation on the ball's spot, strong to side `strength`. */
export function buildFormation(id: FormationId, ballX: number, strength: Side): Formation {
  const def = FORMATIONS[id]
  const placed = def.place(spots(ballX), strength, -strength as Side)
  const players: OffensivePlayer[] = LINE.map((lineId, i) => ({
    id: lineId,
    role: 'line',
    pos: { x: ballX + (i - 2) * LINE_SPLIT, y: ON_LINE },
  }))
  players.push({ id: 'QB', role: 'qb', pos: { x: ballX, y: def.underCenter ? -1.1 : -5 } })
  for (const [playerId, pos] of Object.entries(placed) as [OffenseId, Point][]) {
    players.push({ id: playerId, role: roleOf(playerId, def.personnel), pos })
  }
  return { id, strength, ballX, players, counts: countReceivers(players, ballX) }
}

/** True for a back lined up behind the line, rather than split out as a receiver. */
function inBackfield(player: OffensivePlayer): boolean {
  return player.role === 'back' && player.pos.y < -2.5
}

/**
 * Counts the pass-catchers on each side from the outside in. Backs in the backfield get number 0
 * and the side they stand on, which is the right for a back straight behind the ball.
 */
function countReceivers(
  players: OffensivePlayer[],
  ballX: number,
): Partial<Record<OffenseId, ReceiverCount>> {
  const counts: Partial<Record<OffenseId, ReceiverCount>> = {}
  const catchers = players.filter((p) => p.role !== 'line' && p.role !== 'qb')
  for (const side of [-1, 1] as Side[]) {
    const onSide = catchers
      .filter((p) => !inBackfield(p) && Math.sign(p.pos.x - ballX) === side)
      .sort((a, b) => Math.abs(b.pos.x - ballX) - Math.abs(a.pos.x - ballX))
    onSide.forEach((p, i) => {
      counts[p.id] = {
        side,
        number: i + 1,
        // The attached spot is one line split outside the tackle, 3.9 yards from the ball.
        attached: p.role === 'tightEnd' && Math.abs(p.pos.x - ballX) < 4.5,
      }
    })
  }
  for (const back of catchers.filter(inBackfield)) {
    counts[back.id] = { side: back.pos.x < ballX ? -1 : 1, number: 0, attached: false }
  }
  return counts
}

/** The pass-catcher counted `number` on `side`, if there is one. */
export function receiverAt(
  formation: Formation,
  side: Side,
  number: number,
): OffenseId | undefined {
  return (Object.entries(formation.counts) as [OffenseId, ReceiverCount][]).find(
    ([, c]) => c.side === side && c.number === number,
  )?.[0]
}

/** How many pass-catchers are counted on `side`, leaving out backs in the backfield. */
export function receiversOnSide(formation: Formation, side: Side): number {
  return Object.values(formation.counts).filter((c) => c.side === side && c.number > 0).length
}

export function player(formation: Formation, id: OffenseId): OffensivePlayer {
  const found = formation.players.find((p) => p.id === id)
  if (!found) throw new Error(`No ${id} in ${formation.id}`)
  return found
}

/** Where the motioning player starts, for a formation that the motion ends in. */
export function motionStart(motion: MotionId, formation: Formation): Motion {
  const def = MOTIONS[motion]
  const from = def.from(spots(formation.ballX), -formation.strength as Side)
  return { id: motion, player: def.player, from }
}

/** The formation as it stands before the motion: the motioning player at his starting spot. */
export function beforeMotion(formation: Formation, motion: Motion | null): Formation {
  if (!motion) return formation
  const players = formation.players.map((p) =>
    p.id === motion.player ? { ...p, pos: { ...motion.from } } : p,
  )
  return { ...formation, players, counts: countReceivers(players, formation.ballX) }
}

/** The name a broadcast would use, such as "Gun Trips Right". */
export function formationName(formation: Formation): string {
  return `${FORMATIONS[formation.id].name} ${formation.strength > 0 ? 'Right' : 'Left'}`
}

export const FORMATION_IDS = Object.keys(FORMATIONS) as FormationId[]
