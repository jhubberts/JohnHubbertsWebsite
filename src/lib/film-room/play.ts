/**
 * Builds a random play from a seed: the situation, the offense's formation, motion and pass
 * concept, and the defense's call and pre-snap look. The same seed and request always give the
 * same play.
 */

import { LEFT_HASH, MIDDLE, RIGHT_HASH, type Side } from './field'
import {
  COVERAGES,
  COVERAGE_IDS,
  PRESSURE_IDS,
  buildDefense,
  isFireZone,
  type CoverageId,
  type Defense,
  type DefensiveCall,
  type Look,
  type PackageId,
  type PressureId,
} from './defense'
import {
  FORMATIONS,
  FORMATION_IDS,
  buildFormation,
  motionStart,
  type Formation,
  type FormationId,
  type Motion,
  type MotionId,
  type OffenseId,
} from './offense'
import { createRandom, type Random } from './random'
import type { RealSnap } from './real-snaps'
import { CONCEPT_IDS, assignRoutes, type ConceptId, type RouteAssignment } from './routes'
import { HOME_TEAM } from './teams'
import { bucketFor, coverageWeights, pressureWeights } from './tendencies'

export type Level = 'rookie' | 'starter' | 'pro'

interface LevelDef {
  name: string
  about: string
  coverages: CoverageId[]
  pressures: PressureId[]
  /** Whether Cover 3 can come with a five-man fire zone. */
  fireZone: boolean
  /** Whether the offense motions before the snap. */
  motion: boolean
  /** Whether the defense disguises its call. */
  disguise: boolean
}

export const LEVELS: Record<Level, LevelDef> = {
  rookie: {
    name: 'Rookie',
    about: 'The defense lines up in what it plays. Five coverages, no motion.',
    coverages: ['cover0', 'cover1', 'cover2', 'cover3', 'cover4'],
    pressures: ['four', 'blitz', 'zero'],
    fireZone: false,
    motion: false,
    disguise: false,
  },
  starter: {
    name: 'Starter',
    about: 'All eight coverages, simulated pressure and fire zones, and motion to read.',
    coverages: COVERAGE_IDS,
    pressures: PRESSURE_IDS,
    fireZone: true,
    motion: true,
    disguise: false,
  },
  pro: {
    name: 'Pro',
    about:
      'Disguises: safeties rotate at the snap, corners hide their depth, linebackers mug the A-gaps.',
    coverages: COVERAGE_IDS,
    pressures: PRESSURE_IDS,
    fireZone: true,
    motion: true,
    disguise: true,
  },
}

export const LEVEL_IDS = Object.keys(LEVELS) as Level[]

export interface Situation {
  down: 1 | 2 | 3 | 4
  /** Yards to go for a first down. */
  distance: number
  /** Yards from the offense's own goal line. */
  yardLine: number
  /** The team on offense, such as "CHI", or null when the play names none. */
  offense: string | null
  /** True when the offense is the home team, which wears its colors; the visitors wear white. */
  offenseHome: boolean
  /** The team on defense, or null when the play names none. */
  defense: string | null
}

export interface Play {
  situation: Situation
  /** The formation at the snap, after any motion. */
  formation: Formation
  motion: Motion | null
  concept: ConceptId
  routes: Partial<Record<OffenseId, RouteAssignment>>
  defense: Defense
}

/**
 * Choices that replace random ones: a study session fixes the call, concept or formation, and a
 * quiz names the defense or the real snap to rebuild.
 */
export interface PlayRequest {
  level: Level
  coverage?: CoverageId
  pressure?: PressureId
  concept?: ConceptId
  formation?: FormationId
  /** In study mode: whether the defense disguises its call. */
  disguise?: boolean
  /** The defense whose real tendencies set how often each call comes up; the league by default. */
  team?: string
  /**
   * A real snap to rebuild: its situation, personnel, motion, hash and call. Its call should be
   * one the level teaches, as `snapsFor` ensures; a rush the level does not teach is redrawn.
   */
  snap?: RealSnap
}

const FORMATION_WEIGHTS: Record<FormationId, number> = {
  doubles: 22,
  trips: 18,
  doublesTe: 12,
  trey: 10,
  bunch: 8,
  empty: 10,
  ace: 10,
  iPro: 10,
}

/** Pressures a coverage can be played with at a level. */
export function pressuresWith(coverage: CoverageId, level: Level): PressureId[] {
  const def = LEVELS[level]
  return COVERAGES[coverage].pressures.filter(
    (pressure) =>
      def.pressures.includes(pressure) && (def.fireZone || !isFireZone({ coverage, pressure })),
  )
}

function pickSituation(rng: Random, defense: string | null): Situation {
  const down = rng.weighted<1 | 2 | 3>([
    [1, 40],
    [2, 33],
    [3, 27],
  ])
  const distance =
    down === 1
      ? rng.weighted<number>([
          [10, 9],
          [5, 0.5],
          [15, 0.5],
        ])
      : rng.int(1, 12)
  return {
    down,
    distance,
    yardLine: rng.int(20, 78),
    offense: defense === HOME_TEAM ? null : HOME_TEAM,
    // The Bears are at home, on whichever side they play.
    offenseHome: defense !== HOME_TEAM,
    defense,
  }
}

/** Third or fourth down with 7 or more yards to go. */
function isThirdAndLong(situation: Situation): boolean {
  return bucketFor(situation.down, situation.distance) === 'thirdLong'
}

/**
 * A coverage for the situation, as often as `team` played it there; with `pressure`, only
 * coverages that can be played with it.
 */
function pickCoverage(rng: Random, request: PlayRequest, situation: Situation): CoverageId {
  const { level, pressure } = request
  const weights = coverageWeights(request.team, bucketFor(situation.down, situation.distance))
  const candidates = LEVELS[level].coverages.filter(
    (c) => !pressure || pressuresWith(c, level).includes(pressure),
  )
  return rng.weighted(candidates.map((c) => [c, weights[c]] as const))
}

function pickPressure(rng: Random, coverage: CoverageId, request: PlayRequest): PressureId {
  // A real snap's rush, if the level cannot draw it, is redrawn from that snap's defense.
  const weights = pressureWeights(request.team ?? request.snap?.defense, coverage)
  return rng.weighted(pressuresWith(coverage, request.level).map((p) => [p, weights[p]] as const))
}

function pickPackage(rng: Random, formation: FormationId, situation: Situation): PackageId {
  if (FORMATIONS[formation].personnel !== '11') return 'base'
  return isThirdAndLong(situation) && rng.chance(0.4) ? 'dime' : 'nickel'
}

function pickLook(
  rng: Random,
  coverage: CoverageId,
  pressure: PressureId,
  disguise: boolean,
): Look {
  const shell = COVERAGES[coverage].shell
  const honest: Look = {
    shell,
    cornersDisguised: false,
    manHidden: false,
    mug: false,
    press: rng.chance(0.6),
  }
  if (!disguise) return honest
  const flipShell = rng.chance(0.5)
  const mugChance = coverage === 'cover0' ? 0.6 : pressure === 'sim' ? 0.5 : 0.15
  return {
    ...honest,
    shell: flipShell ? (shell === 2 ? 1 : 2) : shell,
    cornersDisguised: rng.chance(0.5),
    manHidden: rng.chance(0.5),
    mug: rng.chance(mugChance),
  }
}

/** The formations an offense can motion into, and the motion that builds each one. */
const MOTION_INTO: Partial<Record<FormationId, MotionId>> = {
  trips: 'acrossToTrips',
  empty: 'backToEmpty',
}

/**
 * At a level that shows motion, a play in a formation the offense can motion into motions 55% of
 * the time, or always when it rebuilds a real snap that FTN charted with motion.
 */
function pickMotion(
  rng: Random,
  formation: FormationId,
  level: Level,
  snap: RealSnap | undefined,
): MotionId | null {
  if (!LEVELS[level].motion || (snap && !snap.motion)) return null
  const motion = MOTION_INTO[formation]
  return motion && rng.chance(snap ? 1 : 0.55) ? motion : null
}

/**
 * A real snap gets a formation of its personnel. An 11-personnel snap with motion gets one the
 * offense can motion into, at a level that shows motion.
 */
function pickFormation(rng: Random, request: PlayRequest): FormationId {
  if (request.formation) return request.formation
  const { snap } = request
  if (snap?.personnel === '11' && snap.motion && LEVELS[request.level].motion) {
    return rng.pick(Object.keys(MOTION_INTO) as FormationId[])
  }
  const allowed = snap
    ? FORMATION_IDS.filter((f) => FORMATIONS[f].personnel === snap.personnel)
    : FORMATION_IDS
  return rng.weighted(allowed.map((f) => [f, FORMATION_WEIGHTS[f]] as const))
}

/** The ball's x position for each of a real snap's hash values. */
const HASH_X = { [-1]: LEFT_HASH, 0: MIDDLE, 1: RIGHT_HASH } as const

/**
 * Builds the play for a seed. Fixed choices in `request` replace the random ones; fixing a choice
 * changes which random numbers the later choices get, so the rest of the play can differ too.
 */
export function generatePlay(seed: number, request: PlayRequest): Play {
  const rng = createRandom(seed)
  const { level, snap } = request
  const situation: Situation = snap
    ? {
        down: snap.down,
        distance: snap.distance,
        yardLine: 100 - snap.yardsToGoal,
        offense: snap.offense,
        offenseHome: snap.offenseHome,
        defense: snap.defense,
      }
    : pickSituation(rng, request.team ?? null)
  const formationId = pickFormation(rng, request)
  const strength: Side = rng.chance(0.5) ? 1 : -1
  const ballX = snap
    ? HASH_X[snap.hash]
    : rng.weighted([
        [LEFT_HASH, 4],
        [MIDDLE, 2],
        [RIGHT_HASH, 4],
      ])
  const formation = buildFormation(formationId, ballX, strength)
  const motionId = pickMotion(rng, formationId, level, snap)
  const motion = motionId ? motionStart(motionId, formation) : null

  const coverage = snap?.coverage ?? request.coverage ?? pickCoverage(rng, request, situation)
  const allowed = pressuresWith(coverage, level)
  const wanted = snap?.pressure ?? request.pressure
  const pressure =
    wanted && allowed.includes(wanted) ? wanted : pickPressure(rng, coverage, request)
  const call: DefensiveCall = {
    package: pickPackage(rng, formationId, situation),
    coverage,
    pressure,
    look: pickLook(rng, coverage, pressure, request.disguise ?? LEVELS[level].disguise),
  }
  const concept = request.concept ?? rng.pick(CONCEPT_IDS)
  return {
    situation,
    formation,
    motion,
    concept,
    routes: assignRoutes(concept, formation),
    defense: buildDefense(call, formation, rng),
  }
}

/**
 * The situation as a broadcast writes it, such as "3rd & 7 at the CHI 38": a yard line in the
 * offense's half is named for the offense, one in the other half for the defense. A team the play
 * does not name reads "their own 38" or "the opponent's 38".
 */
export function situationText(situation: Situation): string {
  const ordinal = ['1st', '2nd', '3rd', '4th'][situation.down - 1]
  const { yardLine, offense, defense } = situation
  const spot =
    yardLine === 50
      ? 'the 50'
      : yardLine < 50
        ? offense
          ? `the ${offense} ${yardLine}`
          : `their own ${yardLine}`
        : defense
          ? `the ${defense} ${100 - yardLine}`
          : `the opponent's ${100 - yardLine}`
  const togo = yardLine + situation.distance >= 100 ? 'Goal' : String(situation.distance)
  return `${ordinal} & ${togo} at ${spot}`
}
