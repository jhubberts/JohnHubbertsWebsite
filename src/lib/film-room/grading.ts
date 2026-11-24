/**
 * Marks a reader's guess against the play, explains what gave the call away, and keeps a running
 * record of guesses in this browser.
 */

import { browserStorage, type ReadStorage } from '@/lib/browser-storage'
import {
  COVERAGES,
  DEFENDERS,
  alignDefense,
  PACKAGES,
  extraRushers,
  isFireZone,
  linemanDrops,
  rushCount,
  type CoverageId,
  type DefenseId,
  type PressureId,
} from './defense'
import { COVERAGE_GUIDE } from './glossary'
import { CONCEPTS } from './routes'
import type { Play } from './play'

export interface Guess {
  coverage: CoverageId
  pressure: PressureId
}

export interface Marks {
  coverage: boolean
  pressure: boolean
  /** Man or zone was right, even if the coverage was not. */
  family: boolean
  /** The number of deep safeties after the snap was right. */
  shell: boolean
}

export function mark(play: Play, guess: Guess): Marks {
  const actual = COVERAGES[play.defense.call.coverage]
  const guessed = COVERAGES[guess.coverage]
  return {
    coverage: guess.coverage === play.defense.call.coverage,
    pressure: guess.pressure === play.defense.call.pressure,
    family: guessed.family === actual.family,
    shell: guessed.shell === actual.shell,
  }
}

const shellWord = (n: number) =>
  n === 0 ? 'no deep safety' : n === 1 ? 'one high safety' : 'two high safeties'

const named = (id: DefenseId) => DEFENDERS[id].short

/**
 * What a reader could have seen before and at the snap, one sentence each on the safeties, the
 * corners, any motion, any mug look and the rush.
 */
export function tells(play: Play): string[] {
  const { call, players } = play.defense
  const out: string[] = []
  const played = COVERAGES[call.coverage].shell
  const shown = call.look.shell
  if (shown === played) {
    out.push(`The shell was honest: ${shellWord(shown)} before the snap and after it.`)
  } else if (shown === 2 && played === 1) {
    out.push(
      'They showed two high safeties, then rotated at the snap: the strong safety dropped down and the free safety spun to the deep middle. That turns a two-high look into a one-high coverage.',
    )
  } else if (shown === 1 && played === 2) {
    out.push(
      'They showed one high safety with the strong safety down, then he backed out deep at the snap: a one-high look turning into two-high.',
    )
  } else {
    out.push('They showed two high safeties, then both came down at the snap, leaving nobody deep.')
  }

  if (call.look.cornersDisguised) {
    out.push('The corners lined up at a neutral 5 or 6 yards, which tells you nothing.')
  } else {
    out.push(COVERAGE_GUIDE[call.coverage].cornerTell)
  }

  if (play.motion) {
    const mover = play.motion.player
    const chaser = players.find((p) => p.assignment.kind === 'man' && p.assignment.target === mover)
    // Whether he visibly chased depends on the whole look (a deep safety or a mugged
    // linebacker never does), so ask the alignment rather than repeating its rules here.
    const chased = !!chaser && !!alignDefense(play.defense, play.formation)[chaser.id].follows
    if (chaser && chased) {
      out.push(
        `When ${mover} motioned, the ${named(chaser.id)} ran across the formation with him: man coverage.`,
      )
    } else if (chaser) {
      out.push(
        `Nobody ran with ${mover} in motion, which looks like zone. That was the disguise: at the snap the ${named(chaser.id)} picked him up in man.`,
      )
    } else {
      out.push(
        `Nobody ran with ${mover} in motion; the linebackers and safeties slid a yard or two toward him instead ("bumped"). That is a zone tell.`,
      )
    }
  }

  if (call.look.mug) {
    const muggers = PACKAGES[call.package].mug
    const muggedWho = muggers.length === 1 ? `The ${named(muggers[0])}` : 'The linebackers'
    const dropped = muggers.filter(
      (id) => players.find((p) => p.id === id)?.assignment.kind !== 'rush',
    )
    out.push(
      dropped.length === 0
        ? `${muggedWho} mugged the A-gaps and rushed.`
        : `${muggedWho} mugged the A-gaps; at the snap the ${dropped.map(named).join(' and the ')} backed out into coverage.`,
    )
  }

  const drops = linemanDrops(play.defense)
  const extras = extraRushers(play.defense)
  const rushers = rushCount(play.defense)
  if (call.pressure === 'sim') {
    out.push(
      `Four rushed, but the ${named(extras[0])} was one of them while the ${named(drops[0])} dropped into coverage: simulated pressure.`,
    )
  } else if (isFireZone(call)) {
    out.push(
      `Five rushed (${extras.map(named).join(' and ')} blitzed) with three deep and three underneath, and the ${named(drops[0])} dropped: a fire zone.`,
    )
  } else if (call.pressure === 'blitz') {
    out.push(
      `Five rushed: the ${named(extras[0])} blitzed instead of sitting in the middle as a robber.`,
    )
  } else if (call.pressure === 'zero') {
    out.push(`${rushers} rushed with nobody deep: Cover 0.`)
  } else {
    out.push('Only the four linemen rushed.')
  }
  return out
}

/** One sentence on whether the offense's play suited the coverage it got. */
export function conceptVerdict(play: Play): string {
  const concept = CONCEPTS[play.concept]
  const coverage = COVERAGES[play.defense.call.coverage].name
  return concept.beats.includes(play.defense.call.coverage)
    ? `Good call by the offense: ${concept.name} is drawn up to beat ${coverage}.`
    : `${concept.name} is built for ${concept.beats.map((c) => COVERAGES[c].name).join(' or ')}, not ${coverage}, so the quarterback has to work harder here.`
}

export interface Tally {
  seen: number
  right: number
}

export interface Stats {
  plays: number
  streak: number
  best: number
  coverage: Partial<Record<CoverageId, Tally>>
  pressure: Partial<Record<PressureId, Tally>>
}

const STORAGE_KEY = 'filmRoom.stats'

export const EMPTY_STATS: Stats = { plays: 0, streak: 0, best: 0, coverage: {}, pressure: {} }

/** The record kept in this browser, or an empty one. Never throws. */
export function loadStats(storage: ReadStorage | null = browserStorage()): Stats {
  try {
    const raw = storage?.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_STATS
    const parsed = JSON.parse(raw) as Partial<Stats>
    const isObject = (v: unknown) => typeof v === 'object' && v !== null
    // A record in any other shape, from an older version or edited by hand, starts over.
    if (!isObject(parsed) || !isObject(parsed.coverage) || !isObject(parsed.pressure)) {
      return EMPTY_STATS
    }
    return { ...EMPTY_STATS, ...parsed }
  } catch {
    return EMPTY_STATS
  }
}

/** Saves the record. Never throws; without storage the record lasts until the page is closed. */
export function saveStats(
  stats: Stats,
  storage: Pick<Storage, 'setItem'> | null = browserStorage(),
): void {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(stats))
  } catch {
    // Storage is unavailable, for example in a private window.
  }
}

function bump(tally: Tally | undefined, right: boolean): Tally {
  return { seen: (tally?.seen ?? 0) + 1, right: (tally?.right ?? 0) + (right ? 1 : 0) }
}

/** The record after one more marked guess. A play counts toward the streak only if both are right. */
export function record(stats: Stats, play: Play, marks: Marks): Stats {
  const both = marks.coverage && marks.pressure
  const streak = both ? stats.streak + 1 : 0
  const { coverage, pressure } = play.defense.call
  return {
    plays: stats.plays + 1,
    streak,
    best: Math.max(stats.best, streak),
    coverage: { ...stats.coverage, [coverage]: bump(stats.coverage[coverage], marks.coverage) },
    pressure: { ...stats.pressure, [pressure]: bump(stats.pressure[pressure], marks.pressure) },
  }
}
