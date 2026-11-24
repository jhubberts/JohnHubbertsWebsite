/**
 * How often real NFL defenses played each coverage, and how they rushed behind it, from FTN's
 * charting of every dropback (tools/film-room/build_snaps.py writes the data). Generated plays draw
 * their coverage and rush from these counts, for the league or for one defense. A team of
 * `undefined` means the whole league.
 */

import { COVERAGE_IDS, PRESSURE_IDS, type CoverageId, type PressureId } from './defense'
import data from './data/tendencies.json'
import { HOME_TEAM } from './teams'

export type SituationBucket = 'early' | 'thirdShort' | 'thirdMedium' | 'thirdLong'

interface TeamCounts {
  /** Every dropback FTN charted a coverage for, including those counted as "other". */
  charted: number
  /** Dropbacks by situation and charted coverage; coverages the Film Room cannot draw are "other". */
  coverage: Partial<Record<SituationBucket, Partial<Record<CoverageId | 'other', number>>>>
  /** Real snaps by charted coverage and the rush behind it. */
  pressure: Partial<Record<CoverageId, Partial<Record<PressureId, number>>>>
}

/** The data's key for the whole league. */
const LEAGUE = 'NFL'
const TEAMS = data.teams as Record<string, TeamCounts>

export const TENDENCY_SEASONS: number[] = data.seasons
export const ATTRIBUTION: string = data.attribution

/** Every defense in the data, the Bears first and then alphabetical. */
export const DEFENSES: string[] = Object.keys(TEAMS)
  .filter((team) => team !== LEAGUE)
  .sort((a, b) => (a === HOME_TEAM ? -1 : b === HOME_TEAM ? 1 : a.localeCompare(b)))

/**
 * Coverages FTN does not chart separately: the coverage FTN charts each one as, and the share of
 * that coverage's weight drawn as this one instead. Tampa 2's share is an estimate, not a charted
 * number; without it Tampa 2 would never come up.
 */
const FOLDED: Partial<Record<CoverageId, { chartedAs: CoverageId; share: number }>> = {
  tampa2: { chartedAs: 'cover2', share: 1 / 6 },
}

/** Coverages the charting records, in the Film Room's order. */
export const CHARTED_COVERAGES = COVERAGE_IDS.filter((c) => !FOLDED[c])

/** How many dropbacks' worth of the league's mix `blended` adds to a team's counts. */
const LEAGUE_BLEND = 40

/**
 * The situation a play counts under; fourth downs count with third downs. build_snaps.py's
 * `bucket` must match it.
 */
export function bucketFor(down: number, distance: number): SituationBucket {
  if (down < 3) return 'early'
  if (distance <= 3) return 'thirdShort'
  return distance <= 6 ? 'thirdMedium' : 'thirdLong'
}

function shares<K extends string>(counts: Partial<Record<K, number>>, keys: readonly K[]) {
  const total = keys.reduce((sum, k) => sum + (counts[k] ?? 0), 0)
  return Object.fromEntries(keys.map((k) => [k, total ? (counts[k] ?? 0) / total : 0])) as Record<
    K,
    number
  >
}

/**
 * A team's counts with the league's mix added in, so a call the team rarely or never showed still
 * has some weight.
 */
function blended<K extends string>(
  team: Partial<Record<K, number>> | undefined,
  league: Partial<Record<K, number>> | undefined,
  keys: readonly K[],
): Record<K, number> {
  const leagueShares = shares(league ?? {}, keys)
  return Object.fromEntries(
    keys.map((k) => [k, (team?.[k] ?? 0) + LEAGUE_BLEND * leagueShares[k]]),
  ) as Record<K, number>
}

function countsFor(team: string | undefined): TeamCounts | undefined {
  return TEAMS[team ?? LEAGUE]
}

/** Relative weights for each coverage a defense plays in a situation. */
export function coverageWeights(
  team: string | undefined,
  bucket: SituationBucket,
): Record<CoverageId, number> {
  const league = TEAMS[LEAGUE].coverage[bucket]
  const charted = blended(countsFor(team)?.coverage[bucket], league, CHARTED_COVERAGES)
  const weights = { ...charted } as Record<CoverageId, number>
  for (const coverage of COVERAGE_IDS) {
    const fold = FOLDED[coverage]
    if (!fold) continue
    weights[coverage] = charted[fold.chartedAs] * fold.share
    weights[fold.chartedAs] -= weights[coverage]
  }
  return weights
}

/** Relative weights for each way a defense rushed behind a coverage. */
export function pressureWeights(
  team: string | undefined,
  coverage: CoverageId,
): Record<PressureId, number> {
  const charted = FOLDED[coverage]?.chartedAs ?? coverage
  const league = TEAMS[LEAGUE].pressure[charted]
  return blended(countsFor(team)?.pressure[charted], league, PRESSURE_IDS)
}

/** A defense's share of each charted coverage over all situations, or the league's. */
export function coverageMix(team: string | undefined): Record<CoverageId | 'other', number> {
  const totals: Partial<Record<CoverageId | 'other', number>> = {}
  for (const counts of Object.values(countsFor(team)?.coverage ?? {})) {
    for (const [coverage, n] of Object.entries(counts ?? {}) as [CoverageId | 'other', number][]) {
      totals[coverage] = (totals[coverage] ?? 0) + n
    }
  }
  return shares<CoverageId | 'other'>(totals, [...CHARTED_COVERAGES, 'other'])
}

/** How many dropbacks FTN charted a coverage for, for a defense or the league. */
export function chartedDropbacks(team: string | undefined): number {
  return countsFor(team)?.charted ?? 0
}
