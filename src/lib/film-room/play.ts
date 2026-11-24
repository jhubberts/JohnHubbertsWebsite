/**
 * Builds a random play from a seed: the situation, the offense's formation, motion and pass
 * concept, and the defense's call and pre-snap look. The same seed and level always give the
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
  buildFormation,
  motionStart,
  type Formation,
  type FormationId,
  type Motion,
  type MotionId,
  type OffenseId,
} from './offense'
import { createRandom, type Random } from './random'
import { CONCEPT_IDS, assignRoutes, type ConceptId, type RouteAssignment } from './routes'

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
  down: 1 | 2 | 3
  /** Yards to go for a first down. */
  distance: number
  /** Yards from the offense's own goal line. */
  yardLine: number
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

/** Choices a study session can fix instead of leaving them to chance. */
export interface PlayRequest {
  level: Level
  coverage?: CoverageId
  pressure?: PressureId
  concept?: ConceptId
  formation?: FormationId
  /** In study mode: whether the defense disguises its call. */
  disguise?: boolean
}

/**
 * Roughly how often NFL defenses played each coverage on passing downs in recent seasons, from
 * public charting summaries. These weights set how often each coverage comes up and nothing else.
 */
const COVERAGE_WEIGHTS: Record<CoverageId, number> = {
  cover3: 30,
  cover1: 22,
  cover4: 14,
  cover2: 9,
  cover6: 9,
  twoMan: 5,
  cover0: 4,
  tampa2: 3,
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
  return (Object.keys(COVERAGES[coverage].pressures) as PressureId[]).filter(
    (pressure) =>
      def.pressures.includes(pressure) && (def.fireZone || !isFireZone({ coverage, pressure })),
  )
}

function pickSituation(rng: Random): Situation {
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
  return { down, distance, yardLine: rng.int(20, 78) }
}

/** Third down with 7 or more yards to go. */
function isThirdAndLong(situation: Situation): boolean {
  return situation.down === 3 && situation.distance >= 7
}

/** A coverage for the situation; with `pressure`, only coverages that can be played with it. */
function pickCoverage(
  rng: Random,
  level: Level,
  situation: Situation,
  pressure: PressureId | undefined,
): CoverageId {
  const thirdAndLong = isThirdAndLong(situation)
  const thirdAndShort = situation.down === 3 && situation.distance <= 3
  const candidates = LEVELS[level].coverages.filter(
    (c) => !pressure || pressuresWith(c, level).includes(pressure),
  )
  return rng.weighted(
    candidates.map((c) => {
      let w = COVERAGE_WEIGHTS[c]
      if (thirdAndLong && c === 'twoMan') w *= 3
      if (thirdAndLong && c === 'cover0') w *= 0.6
      if (thirdAndShort && c === 'cover0') w *= 2.5
      if (thirdAndShort && c === 'cover1') w *= 1.5
      return [c, w] as const
    }),
  )
}

function pickPressure(rng: Random, coverage: CoverageId, level: Level): PressureId {
  const weights = COVERAGES[coverage].pressures
  return rng.weighted(pressuresWith(coverage, level).map((p) => [p, weights[p] ?? 1] as const))
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

function pickMotion(rng: Random, formation: FormationId, level: Level): MotionId | null {
  if (!LEVELS[level].motion) return null
  if (formation === 'trips' && rng.chance(0.55)) return 'acrossToTrips'
  if (formation === 'empty' && rng.chance(0.55)) return 'backToEmpty'
  return null
}

/**
 * Builds the play for a seed. Fixed choices in `request` replace the random ones; fixing a choice
 * changes which random numbers the later choices get, so the rest of the play can differ too.
 */
export function generatePlay(seed: number, request: PlayRequest): Play {
  const rng = createRandom(seed)
  const { level } = request
  const situation = pickSituation(rng)
  const formationId =
    request.formation ?? rng.weighted(Object.entries(FORMATION_WEIGHTS) as [FormationId, number][])
  const strength: Side = rng.chance(0.5) ? 1 : -1
  const ballX = rng.weighted([
    [LEFT_HASH, 4],
    [MIDDLE, 2],
    [RIGHT_HASH, 4],
  ])
  const formation = buildFormation(formationId, ballX, strength)
  const motionId = pickMotion(rng, formationId, level)
  const motion = motionId ? motionStart(motionId, formation) : null

  const coverage = request.coverage ?? pickCoverage(rng, level, situation, request.pressure)
  const allowed = pressuresWith(coverage, level)
  const pressure =
    request.pressure && allowed.includes(request.pressure)
      ? request.pressure
      : pickPressure(rng, coverage, level)
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
 * The situation as a broadcast writes it, such as "3rd & 7 at the CHI 38". The offense is CHI, so
 * a yard line in its own half reads "the CHI 38" and one in the other half "the opponent's 38".
 */
export function situationText(situation: Situation): string {
  const ordinal = ['1st', '2nd', '3rd'][situation.down - 1]
  const { yardLine } = situation
  const spot =
    yardLine === 50
      ? 'the 50'
      : yardLine < 50
        ? `the CHI ${yardLine}`
        : `the opponent's ${100 - yardLine}`
  const togo = yardLine + situation.distance >= 100 ? 'Goal' : String(situation.distance)
  return `${ordinal} & ${togo} at ${spot}`
}
