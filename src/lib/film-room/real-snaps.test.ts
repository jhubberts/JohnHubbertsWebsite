import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { COVERAGES, PRESSURE_IDS } from './defense'
import { LEVELS, LEVEL_IDS, generatePlay, pressuresWith } from './play'
import { decodeSnaps, snapForSeed, snapsFor } from './real-snaps'
import { DEFENSES, coverageWeights, pressureWeights, type SituationBucket } from './tendencies'

const file = JSON.parse(readFileSync('public/film-room/real-snaps.json', 'utf8'))
const snaps = decodeSnaps(file)

describe('the snaps a quiz draws from', () => {
  it('decodes every row into a snap with a known call and known teams', () => {
    const unknown = snaps.filter(
      (snap) =>
        !COVERAGES[snap.coverage] ||
        !PRESSURE_IDS.includes(snap.pressure) ||
        !DEFENSES.includes(snap.defense) ||
        !DEFENSES.includes(snap.offense),
    )
    expect(snaps.length).toBeGreaterThan(30000)
    expect(unknown.map((snap) => snap.id)).toEqual([])
  })

  it('gives a rookie only the five basic coverages, without simulated pressure or a fire zone', () => {
    // Arrange
    const rookieCalls = [
      'cover0/zero',
      'cover1/four',
      'cover1/blitz',
      'cover2/four',
      'cover2/blitz',
      'cover3/four',
      'cover4/four',
      'cover4/blitz',
    ]

    // Act
    const pool = snapsFor(snaps, undefined, 'rookie')

    // Assert
    const poolCalls = new Set(pool.map((snap) => `${snap.coverage}/${snap.pressure}`))
    expect(pool.length).toBeGreaterThan(10000)
    expect(rookieCalls).toEqual(expect.arrayContaining([...poolCalls]))
  })

  it.each(LEVEL_IDS)('rebuilds every call in the %s pool as the call FTN charted', (level) => {
    // Arrange: one snap for each call the pool holds.
    const pool = snapsFor(snaps, undefined, level)
    const oneOfEachCall = [
      ...new Map(pool.map((snap) => [`${snap.coverage}/${snap.pressure}`, snap])).values(),
    ]
    expect(pool.length).toBeGreaterThan(10000)

    // Act
    const changed = oneOfEachCall.filter((snap) => {
      const { coverage, pressure } = generatePlay(snap.id, { level, snap }).defense.call
      return coverage !== snap.coverage || pressure !== snap.pressure
    })

    // Assert
    expect(changed).toEqual([])
  })

  it('has hundreds of snaps for every defense, even at the rookie level', () => {
    const thin = DEFENSES.filter((team) => snapsFor(snaps, team, 'rookie').length < 300)
    expect(DEFENSES).toHaveLength(32)
    expect(thin).toEqual([])
  })

  it('picks the same snap for a seed each time the snaps load', () => {
    // Act
    const first = snapForSeed(snapsFor(snaps, 'CHI', 'pro'), 42)
    const again = snapForSeed(snapsFor(decodeSnaps(file), 'CHI', 'pro'), 42)

    // Assert
    expect(first).toBeDefined()
    expect(again).toEqual(first)
  })

  it('picks no snap from an empty pool', () => {
    expect(snapForSeed([], 42)).toBeUndefined()
  })

  it('has a play description for every snap, in its defense’s file', () => {
    const defenses = [...new Set(snaps.map((snap) => snap.defense))]
    const missing = defenses.flatMap((team) => {
      const texts = JSON.parse(readFileSync(`public/film-room/plays/${team}.json`, 'utf8'))
      return snaps.filter((snap) => snap.defense === team && !texts[snap.id]).map((snap) => snap.id)
    })
    expect(missing).toEqual([])
  })
})

describe('tendencies', () => {
  const BUCKETS: SituationBucket[] = ['early', 'thirdShort', 'thirdMedium', 'thirdLong']
  /** The league, then every defense. */
  const TEAMS = [undefined, ...DEFENSES]

  // The pro level draws every coverage and every pressure the other levels draw.
  it('give every coverage a level can draw a chance to come up, for every team and situation', () => {
    const never = TEAMS.flatMap((team) =>
      BUCKETS.flatMap((bucket) => {
        const weights = coverageWeights(team, bucket)
        return LEVELS.pro.coverages
          .filter((coverage) => !(weights[coverage] > 0))
          .map((coverage) => `${team ?? 'NFL'} ${bucket} ${coverage}`)
      }),
    )
    expect(never).toEqual([])
  })

  it('give every rush a level can draw behind a coverage a chance to come up, for every team', () => {
    const never = TEAMS.flatMap((team) =>
      LEVELS.pro.coverages.flatMap((coverage) => {
        const weights = pressureWeights(team, coverage)
        return pressuresWith(coverage, 'pro')
          .filter((pressure) => !(weights[pressure] > 0))
          .map((pressure) => `${team ?? 'NFL'} ${coverage}/${pressure}`)
      }),
    )
    expect(never).toEqual([])
  })
})
