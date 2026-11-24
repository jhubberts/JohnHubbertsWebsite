/**
 * The defense: which eleven players are on the field, what each one does after the snap (his
 * assignment), and where he lines up before it. Where he lines up can show the coverage or hide
 * it; hiding it is the disguise the Film Room asks the reader to see through.
 */

import { MIDDLE, distance, type Point, type Side } from './field'
import {
  player,
  receiverAt,
  receiversOnSide,
  type Formation,
  type OffenseId,
  type OffensivePlayer,
} from './offense'
import type { Random } from './random'
import { zoneOn, ZONES, type ZoneId } from './zones'

export type DefenseId =
  | 'DE_S'
  | 'DT_S'
  | 'DT_W'
  | 'DE_W'
  | 'SAM'
  | 'MIKE'
  | 'WILL'
  | 'NB'
  | 'DB'
  | 'CB_S'
  | 'CB_W'
  | 'SS'
  | 'FS'
export type DefenseRole = 'line' | 'linebacker' | 'corner' | 'nickel' | 'safety'
export type PackageId = 'base' | 'nickel' | 'dime'
export type CoverageId =
  | 'cover0'
  | 'cover1'
  | 'cover2'
  | 'tampa2'
  | 'twoMan'
  | 'cover3'
  | 'cover4'
  | 'cover6'
export type PressureId = 'four' | 'sim' | 'blitz' | 'zero'
/** How many safeties are deep: 0, 1 ("single-high") or 2 ("two-high"). */
export type Shell = 0 | 1 | 2

export type Assignment =
  | { kind: 'rush' }
  | {
      kind: 'man'
      target: OffenseId
      /** Plays underneath the receiver, trusting a deep safety to be over the top. */
      trail: boolean
    }
  | { kind: 'zone'; zone: ZoneId }

export interface DefensivePlayer {
  id: DefenseId
  role: DefenseRole
  assignment: Assignment
}

/** What the defense shows before the snap, which may differ from what it plays. */
export interface Look {
  shell: Shell
  /** Corners line up on their receiver at 5.5 yards, whatever the coverage. */
  cornersDisguised: boolean
  /**
   * Linebackers and nickel and dime backs in man stay at their usual spots instead of lining up
   * over their receiver. Corners and safeties are not affected.
   */
  manHidden: boolean
  /** Linebackers walked up into the gaps on each side of the center. */
  mug: boolean
  /** In Cover 1, corners press at the line instead of playing off. */
  press: boolean
}

export interface DefensiveCall {
  package: PackageId
  coverage: CoverageId
  pressure: PressureId
  look: Look
}

export interface Defense {
  call: DefensiveCall
  players: DefensivePlayer[]
}

interface DefenderDef {
  /** The letters drawn on his circle. */
  label: string
  name: string
  /** How a sentence names him: "the free safety", "the Mike linebacker". */
  short: string
  role: DefenseRole
}

export const DEFENDERS: Record<DefenseId, DefenderDef> = {
  DE_S: { label: 'E', name: 'Defensive end', short: 'defensive end', role: 'line' },
  DT_S: { label: 'T', name: 'Defensive tackle', short: 'defensive tackle', role: 'line' },
  DT_W: { label: 'T', name: 'Defensive tackle', short: 'defensive tackle', role: 'line' },
  DE_W: { label: 'E', name: 'Defensive end', short: 'defensive end', role: 'line' },
  SAM: {
    label: 'S',
    name: 'Sam linebacker (strong side)',
    short: 'Sam linebacker',
    role: 'linebacker',
  },
  MIKE: {
    label: 'M',
    name: 'Mike linebacker (middle)',
    short: 'Mike linebacker',
    role: 'linebacker',
  },
  WILL: {
    label: 'W',
    name: 'Will linebacker (weak side)',
    short: 'Will linebacker',
    role: 'linebacker',
  },
  NB: { label: 'N', name: 'Nickel back (slot corner)', short: 'nickel back', role: 'nickel' },
  DB: { label: 'D', name: 'Dime back', short: 'dime back', role: 'nickel' },
  CB_S: { label: 'C', name: 'Cornerback', short: 'cornerback', role: 'corner' },
  CB_W: { label: 'C', name: 'Cornerback', short: 'cornerback', role: 'corner' },
  SS: { label: 'SS', name: 'Strong safety', short: 'strong safety', role: 'safety' },
  FS: { label: 'FS', name: 'Free safety', short: 'free safety', role: 'safety' },
}

const LINEMEN: DefenseId[] = ['DE_S', 'DT_S', 'DT_W', 'DE_W']
const SECONDARY: DefenseId[] = ['CB_S', 'CB_W', 'SS', 'FS']

interface PackageDef {
  name: string
  /** What the package is and when a defense uses it. */
  about: string
  /** The three underneath defenders between the linemen and the secondary. */
  under: DefenseId[]
  /** The linebackers who walk up into the A-gaps in a mug look. */
  mug: DefenseId[]
}

export const PACKAGES: Record<PackageId, PackageDef> = {
  base: {
    name: 'Base 4-3',
    about:
      'Four linemen, three linebackers and four defensive backs: the standard group against two tight ends or a fullback.',
    under: ['SAM', 'MIKE', 'WILL'],
    mug: ['MIKE', 'WILL'],
  },
  nickel: {
    name: 'Nickel 4-2-5',
    about:
      'Four linemen, two linebackers and five defensive backs. The fifth, the nickel back, covers the slot. The most common defensive package in the NFL, used against three receivers.',
    under: ['NB', 'MIKE', 'WILL'],
    mug: ['MIKE', 'WILL'],
  },
  dime: {
    name: 'Dime 4-1-6',
    about:
      'Four linemen, one linebacker and six defensive backs, for obvious passing downs such as third and long.',
    under: ['NB', 'DB', 'MIKE'],
    mug: ['MIKE'],
  },
}

/**
 * How a corner lines up when the defense is not hiding it. `man` presses or plays off depending
 * on the look, always shaded inside his receiver.
 */
type CornerTechnique = 'press' | 'man' | 'squat' | 'off' | 'level'

interface CoverageDef {
  name: string
  family: 'man' | 'zone'
  /** How many safeties play deep after the snap. */
  shell: Shell
  /**
   * The pressures the Film Room can draw behind this coverage. How often each comes up is in
   * data/tendencies.json.
   */
  pressures: PressureId[]
  /** The corners' technique, strong side then weak side. */
  corners: [CornerTechnique, CornerTechnique]
  /** How far off the ball a man defender lines up over an inside receiver, in yards. */
  manDepth?: number
}

export const COVERAGES: Record<CoverageId, CoverageDef> = {
  cover0: {
    name: 'Cover 0',
    family: 'man',
    shell: 0,
    pressures: ['zero'],
    corners: ['press', 'press'],
    manDepth: 2,
  },
  cover1: {
    name: 'Cover 1',
    family: 'man',
    shell: 1,
    pressures: ['four', 'blitz'],
    corners: ['man', 'man'],
    manDepth: 3.5,
  },
  cover2: {
    name: 'Cover 2',
    family: 'zone',
    shell: 2,
    pressures: ['four', 'sim', 'blitz'],
    corners: ['squat', 'squat'],
  },
  tampa2: {
    name: 'Tampa 2',
    family: 'zone',
    shell: 2,
    pressures: ['four'],
    corners: ['squat', 'squat'],
  },
  twoMan: {
    name: '2-Man',
    family: 'man',
    shell: 2,
    pressures: ['four'],
    corners: ['press', 'press'],
    manDepth: 2,
  },
  cover3: {
    name: 'Cover 3',
    family: 'zone',
    shell: 1,
    pressures: ['four', 'sim', 'blitz'],
    corners: ['off', 'off'],
  },
  cover4: {
    name: 'Cover 4 (Quarters)',
    family: 'zone',
    shell: 2,
    pressures: ['four', 'sim', 'blitz'],
    corners: ['level', 'level'],
  },
  cover6: {
    name: 'Cover 6',
    family: 'zone',
    shell: 2,
    pressures: ['four', 'sim', 'blitz'],
    corners: ['off', 'squat'],
  },
}

export const COVERAGE_IDS = Object.keys(COVERAGES) as CoverageId[]

export const PRESSURES: Record<PressureId, { name: string }> = {
  four: { name: 'Four-man rush' },
  sim: { name: 'Simulated pressure' },
  blitz: { name: 'Blitz (5 or more)' },
  zero: { name: 'All-out, nobody deep' },
}

export const PRESSURE_IDS = Object.keys(PRESSURES) as PressureId[]

/**
 * True for Cover 3 with a five-man blitz, which the defense plays as a fire zone: three deep,
 * three short, and a defensive end dropping into coverage.
 */
export function isFireZone(call: Pick<DefensiveCall, 'coverage' | 'pressure'>): boolean {
  return call.coverage === 'cover3' && call.pressure === 'blitz'
}

/** The full name of what the defense played, such as "Cover 3 fire zone". */
export function callName(call: DefensiveCall): string {
  const coverage = COVERAGES[call.coverage].name
  if (call.pressure === 'four') return coverage
  if (isFireZone(call)) return `${coverage} fire zone`
  if (call.pressure === 'zero') return `${coverage}, all-out blitz`
  if (call.pressure === 'blitz') return `${coverage} blitz`
  return `${coverage}, ${PRESSURES[call.pressure].name.toLowerCase()}`
}

/** True for a pass-catcher who is split out, as opposed to a back or an attached tight end. */
function detached(formation: Formation, id: OffenseId): boolean {
  const count = formation.counts[id]
  return !!count && count.number > 0 && !count.attached
}

function attachedEnd(formation: Formation, side: Side): OffensivePlayer | undefined {
  const id = (Object.keys(formation.counts) as OffenseId[]).find((key) => {
    const c = formation.counts[key]
    return c?.attached && c.side === side
  })
  return id ? player(formation, id) : undefined
}

/**
 * The slot receivers a nickel and a dime back line up over, in the order they are handed out:
 * the strong side's second receiver, the weak side's second, then the strong side's third.
 */
function slotsToCover(formation: Formation): OffensivePlayer[] {
  const s = formation.strength
  const w = -s as Side
  const order: [Side, number][] = [
    [s, 2],
    [w, 2],
    [s, 3],
  ]
  return order
    .map(([side, n]) => receiverAt(formation, side, n))
    .filter((id): id is OffenseId => !!id && detached(formation, id))
    .map((id) => player(formation, id))
}

/** The safeties a shell puts near the line rather than deep. */
function safetiesDown(shell: Shell): DefenseId[] {
  return shell === 0 ? ['SS', 'FS'] : shell === 1 ? ['SS'] : []
}

/**
 * Where each defender stands when he shows nothing: linemen in their techniques, linebackers in
 * the box, nickel and dime backs over slots, corners over the widest receivers, and safeties as
 * the shell says.
 */
function homeSpots(formation: Formation, shell: Shell, mug: boolean): Record<DefenseId, Point> {
  const s = formation.strength
  const w = -s as Side
  const bx = formation.ballX
  const lineX = (id: OffenseId) => player(formation, id).pos.x
  const tackle = (side: Side) => lineX(side < 0 ? 'LT' : 'RT')
  const guard = (side: Side) => lineX(side < 0 ? 'LG' : 'RG')
  const strongEnd = attachedEnd(formation, s)
  const weakEnd = attachedEnd(formation, w)
  // Linebackers and safeties lean toward the side with more receivers, so a motion that
  // makes trips slides them over ("bumps" them) without anyone running with the motion.
  const lean = s * (receiversOnSide(formation, s) - receiversOnSide(formation, w))
  const spots: Partial<Record<DefenseId, Point>> = {
    DE_S: { x: strongEnd ? strongEnd.pos.x + s * 0.9 : tackle(s) + s * 1.2, y: 1 },
    DT_S: { x: guard(s) + s * 0.6, y: 1 },
    DT_W: { x: mug ? guard(w) + w * 0.6 : bx + w * 0.6, y: 1 },
    DE_W: { x: weakEnd ? weakEnd.pos.x + w * 0.9 : tackle(w) + w * 1.2, y: 1 },
    MIKE: mug ? { x: bx + s * 0.65, y: 1.1 } : { x: bx + s * 0.8 + lean * 0.8, y: 4.5 },
    WILL: mug ? { x: bx + w * 0.65, y: 1.1 } : { x: bx + w * 3.2 + lean * 1.2, y: 4.5 },
    SAM: strongEnd ? { x: strongEnd.pos.x + s * 0.4, y: 3.5 } : { x: bx + s * 4, y: 4.5 },
  }
  const slots = slotsToCover(formation)
  const over = (r: OffensivePlayer | undefined, depth: number): Point =>
    r ? { x: r.pos.x - Math.sign(r.pos.x - bx) * 1.5, y: depth } : { x: bx + w * 2, y: depth }
  spots.NB = over(slots[0], 5)
  spots.DB = over(slots[1], 5.5)

  for (const [id, side] of [
    ['CB_S', s],
    ['CB_W', w],
  ] as [DefenseId, Side][]) {
    const wide = receiverAt(formation, side, 1)
    const x = wide ? player(formation, wide).pos.x : tackle(side) + side * 8
    spots[id] = { x, y: 6.5 }
  }

  const down = safetiesDown(shell)
  spots.SS = down.includes('SS')
    ? { x: strongEnd ? strongEnd.pos.x + s * 3 : tackle(s) + s * 4.5, y: shell === 0 ? 6 : 7.5 }
    : { x: MIDDLE + s * 9.5 + lean, y: 12.5 }
  spots.FS = down.includes('FS')
    ? { x: bx + w * 2.5, y: 6.5 }
    : shell === 1
      ? { x: MIDDLE + s + lean, y: 14 }
      : { x: MIDDLE + w * 9.5 + lean, y: 12.5 }
  return spots as Record<DefenseId, Point>
}

/**
 * Gives the defenders the zones in order across the field: the leftmost defender takes the zone
 * whose landmark is leftmost, and so on, so no defender crosses the field to reach his zone.
 */
function zonesAcross(
  out: Partial<Record<DefenseId, Assignment>>,
  ids: DefenseId[],
  zones: ZoneId[],
  homes: Record<DefenseId, Point>,
) {
  const defenders = [...ids].sort((a, b) => homes[a].x - homes[b].x)
  const ordered = [...zones].sort((a, b) => ZONES[a].landmark.x - ZONES[b].landmark.x)
  defenders.forEach((id, i) => {
    out[id] = { kind: 'zone', zone: ordered[i] }
  })
}

/**
 * Matches defenders to receivers one pair at a time, closest pair first, and returns the
 * defenders left without a receiver. A linebacker is kept off a split-out receiver when a
 * defensive back can take him.
 */
function matchMan(
  out: Partial<Record<DefenseId, Assignment>>,
  defenders: DefenseId[],
  targets: OffenseId[],
  formation: Formation,
  homes: Record<DefenseId, Point>,
  trail: boolean,
): DefenseId[] {
  const freeDefenders = [...defenders]
  const openTargets = [...targets]
  while (openTargets.length && freeDefenders.length) {
    let best = { cost: Infinity, d: 0, t: 0 }
    for (let i = 0; i < freeDefenders.length; i++) {
      for (let j = 0; j < openTargets.length; j++) {
        const linebacker = DEFENDERS[freeDefenders[i]].role === 'linebacker'
        // Six extra yards for a linebacker on a split-out receiver, so a defensive back up to six
        // yards farther away is matched to him first.
        const penalty = linebacker && detached(formation, openTargets[j]) ? 6 : 0
        const cost =
          distance(homes[freeDefenders[i]], player(formation, openTargets[j]).pos) + penalty
        if (cost < best.cost) best = { cost, d: i, t: j }
      }
    }
    out[freeDefenders[best.d]] = { kind: 'man', target: openTargets[best.t], trail }
    freeDefenders.splice(best.d, 1)
    openTargets.splice(best.t, 1)
  }
  return freeDefenders
}

/** Every pass-catcher except the widest receiver on each side. */
function insideTargets(formation: Formation): OffenseId[] {
  const s = formation.strength
  const wides = [receiverAt(formation, s, 1), receiverAt(formation, -s as Side, 1)]
  return (Object.keys(formation.counts) as OffenseId[]).filter((id) => !wides.includes(id))
}

function cornersOnWides(
  out: Partial<Record<DefenseId, Assignment>>,
  formation: Formation,
  trail: boolean,
) {
  const s = formation.strength
  const strongWide = receiverAt(formation, s, 1)
  const weakWide = receiverAt(formation, -s as Side, 1)
  if (strongWide) out.CB_S = { kind: 'man', target: strongWide, trail }
  if (weakWide) out.CB_W = { kind: 'man', target: weakWide, trail }
}

/** The defensive end on the other side of the ball from `blitzer`, who drops when he rushes. */
function dropperFor(
  blitzer: DefenseId,
  formation: Formation,
  homes: Record<DefenseId, Point>,
): DefenseId {
  const blitzSide = Math.sign(homes[blitzer].x - formation.ballX) || formation.strength
  return blitzSide === formation.strength ? 'DE_W' : 'DE_S'
}

function zoneOf(a: Assignment | undefined): ZoneId | undefined {
  return a?.kind === 'zone' ? a.zone : undefined
}

/** Decides every defender's assignment for a call against a formation. */
export function buildDefense(call: DefensiveCall, formation: Formation, rng: Random): Defense {
  const s = formation.strength
  const w = -s as Side
  const homes = homeSpots(formation, COVERAGES[call.coverage].shell, false)
  const under = PACKAGES[call.package].under
  const out: Partial<Record<DefenseId, Assignment>> = {}
  for (const id of LINEMEN) out[id] = { kind: 'rush' }

  switch (call.coverage) {
    case 'cover0': {
      cornersOnWides(out, formation, false)
      const pool: DefenseId[] = ['SS', 'FS', ...under]
      const spare = matchMan(out, pool, insideTargets(formation), formation, homes, false)
      for (const id of spare) out[id] = { kind: 'rush' }
      break
    }
    case 'cover1': {
      cornersOnWides(out, formation, false)
      out.FS = { kind: 'zone', zone: 'deepThirdM' }
      const pool: DefenseId[] = ['SS', ...under]
      const spare = matchMan(out, pool, insideTargets(formation), formation, homes, false)
      spare.forEach((id, i) => {
        out[id] =
          i === 0 && call.pressure === 'four' ? { kind: 'zone', zone: 'hole' } : { kind: 'rush' }
      })
      break
    }
    case 'twoMan': {
      cornersOnWides(out, formation, true)
      out.SS = { kind: 'zone', zone: zoneOn('deepHalf', s) }
      out.FS = { kind: 'zone', zone: zoneOn('deepHalf', w) }
      const spare = matchMan(out, under, insideTargets(formation), formation, homes, true)
      for (const id of spare) out[id] = { kind: 'zone', zone: 'hookM' }
      break
    }
    case 'cover2':
    case 'tampa2': {
      out.CB_S = { kind: 'zone', zone: zoneOn('flat', s) }
      out.CB_W = { kind: 'zone', zone: zoneOn('flat', w) }
      out.SS = { kind: 'zone', zone: zoneOn('deepHalf', s) }
      out.FS = { kind: 'zone', zone: zoneOn('deepHalf', w) }
      if (call.coverage === 'tampa2') {
        const others = under.filter((id) => id !== 'MIKE')
        zonesAcross(out, others, ['hookCurlL', 'hookCurlR'], homes)
        out.MIKE = { kind: 'zone', zone: 'tampaMiddle' }
      } else {
        zonesAcross(out, under, ['hookCurlL', 'hookM', 'hookCurlR'], homes)
      }
      break
    }
    case 'cover3': {
      out.CB_S = { kind: 'zone', zone: zoneOn('deepThird', s) }
      out.CB_W = { kind: 'zone', zone: zoneOn('deepThird', w) }
      out.FS = { kind: 'zone', zone: 'deepThirdM' }
      zonesAcross(out, ['SS', ...under], ['curlFlatL', 'hookL', 'hookR', 'curlFlatR'], homes)
      break
    }
    case 'cover4': {
      out.CB_S = { kind: 'zone', zone: zoneOn('deepQuarter', s) }
      out.CB_W = { kind: 'zone', zone: zoneOn('deepQuarter', w) }
      out.SS = { kind: 'zone', zone: zoneOn('deepQuarterInner', s) }
      out.FS = { kind: 'zone', zone: zoneOn('deepQuarterInner', w) }
      zonesAcross(out, under, ['curlFlatL', 'hookM', 'curlFlatR'], homes)
      break
    }
    case 'cover6': {
      out.CB_S = { kind: 'zone', zone: zoneOn('deepQuarter', s) }
      out.SS = { kind: 'zone', zone: zoneOn('deepQuarterInner', s) }
      out.FS = { kind: 'zone', zone: zoneOn('deepHalf', w) }
      out.CB_W = { kind: 'zone', zone: zoneOn('flat', w) }
      const zones: ZoneId[] =
        s > 0 ? ['hookCurlL', 'hookM', 'curlFlatR'] : ['curlFlatL', 'hookM', 'hookCurlR']
      zonesAcross(out, under, zones, homes)
      break
    }
  }

  const shortZone = (id: DefenseId) => {
    const zone = zoneOf(out[id])
    return !!zone && !ZONES[zone].deep
  }
  // A sim pressure or a fire zone sends underneath defenders and drops a defensive end in their
  // place, then gives the short zones out again from left to right.
  if (call.pressure === 'sim') {
    const blitzer = rng.pick(under.filter(shortZone))
    const dropper = dropperFor(blitzer, formation, homes)
    const droppers = ([...under, 'SS', 'FS'] as DefenseId[]).filter(
      (id) => id !== blitzer && shortZone(id),
    )
    const zones = [...droppers, blitzer].map((id) => zoneOf(out[id]) as ZoneId)
    out[blitzer] = { kind: 'rush' }
    zonesAcross(out, [...droppers, dropper], zones, homes)
  }
  if (isFireZone(call)) {
    const first = rng.pick(under)
    const second = rng.pick(under.filter((id) => id !== first))
    const dropper = dropperFor(first, formation, homes)
    out[first] = { kind: 'rush' }
    out[second] = { kind: 'rush' }
    const droppers = (['SS', ...under, dropper] as DefenseId[]).filter(
      (id) => id !== first && id !== second,
    )
    zonesAcross(out, droppers, ['curlFlatL', 'hookM', 'curlFlatR'], homes)
  }
  if (call.pressure === 'blitz' && COVERAGES[call.coverage].shell === 2) {
    // A five-man blitz behind two deep safeties: one underneath defender rushes, the others keep
    // their zones, and nobody covers the zone he leaves.
    out[rng.pick(under.filter(shortZone))] = { kind: 'rush' }
  }

  const players = [...LINEMEN, ...under, ...SECONDARY].map((id) => {
    const assignment = out[id]
    if (!assignment) throw new Error(`${call.coverage} left ${id} without an assignment`)
    return { id, role: DEFENDERS[id].role, assignment }
  })
  return { call, players }
}

/** Where a defender lines up for the snap. */
export interface Alignment {
  pos: Point
  /**
   * Set for a man defender lined up over his receiver: he keeps `dx` yards across from `target`
   * as the receiver moves before the snap.
   */
  follows?: { target: OffenseId; dx: number }
}

/** Where a corner lines up, from `home`, the spot over the widest receiver on his side. */
function cornerSpot(call: DefensiveCall, id: DefenseId, home: Point, formation: Formation): Point {
  const side = Math.sign(home.x - formation.ballX) as Side
  const receiverX = home.x
  if (call.look.cornersDisguised) return { x: receiverX, y: 5.5 }
  const [strong, weak] = COVERAGES[call.coverage].corners
  switch (id === 'CB_W' ? weak : strong) {
    case 'press':
      return { x: receiverX - side * 0.6, y: 1 }
    case 'man':
      return { x: receiverX - side * 0.6, y: call.look.press ? 1 : 5.5 }
    case 'squat':
      return { x: receiverX + side, y: 4.5 }
    case 'off':
      return { x: receiverX + side, y: 7 }
    case 'level':
      return { x: receiverX, y: 7.5 }
  }
}

/**
 * Lines the defense up against a formation, as the call's look shows it. The simulation calls it
 * for the formation before a motion and after it; defenders who do not follow the motion slide
 * between the two spots.
 */
export function alignDefense(defense: Defense, formation: Formation): Record<DefenseId, Alignment> {
  const { call } = defense
  const homes = homeSpots(formation, call.look.shell, call.look.mug)
  const down = safetiesDown(call.look.shell)
  const muggers = call.look.mug ? PACKAGES[call.package].mug : []
  const result: Partial<Record<DefenseId, Alignment>> = {}
  for (const d of defense.players) {
    const home = homes[d.id]
    const a = d.assignment
    if (d.role === 'corner') {
      const pos = cornerSpot(call, d.id, home, formation)
      const target = a.kind === 'man' ? player(formation, a.target) : undefined
      result[d.id] = {
        pos,
        follows:
          target && !call.look.cornersDisguised
            ? { target: target.id, dx: pos.x - target.pos.x }
            : undefined,
      }
      continue
    }
    const canShowMan =
      d.role === 'safety' ? down.includes(d.id) : !call.look.manHidden && !muggers.includes(d.id)
    if (a.kind === 'man' && canShowMan && detached(formation, a.target)) {
      const target = player(formation, a.target)
      const side = Math.sign(target.pos.x - formation.ballX)
      const pos = { x: target.pos.x - side * 0.7, y: COVERAGES[call.coverage].manDepth ?? 2 }
      result[d.id] = { pos, follows: { target: target.id, dx: pos.x - target.pos.x } }
      continue
    }
    result[d.id] = { pos: home }
  }
  return result as Record<DefenseId, Alignment>
}

/** How many defenders rush the passer. */
export function rushCount(defense: Defense): number {
  return defense.players.filter((p) => p.assignment.kind === 'rush').length
}

/** Linemen who drop into coverage. */
export function linemanDrops(defense: Defense): DefenseId[] {
  return defense.players
    .filter((p) => p.role === 'line' && p.assignment.kind !== 'rush')
    .map((p) => p.id)
}

/** Defenders who are not linemen but rush. */
export function extraRushers(defense: Defense): DefenseId[] {
  return defense.players
    .filter((p) => p.role !== 'line' && p.assignment.kind === 'rush')
    .map((p) => p.id)
}
