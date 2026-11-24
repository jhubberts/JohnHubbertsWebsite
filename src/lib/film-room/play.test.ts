import { describe, expect, it } from 'vitest'
import { COVERAGES, COVERAGE_IDS } from './defense'
import { distance } from './field'
import { EMPTY_STATS, mark, record, type Marks } from './grading'
import { FORMATIONS, player } from './offense'
import { generatePlay, type Level } from './play'
import type { RealSnap } from './real-snaps'
import { simulate } from './simulate'

const SEEDS = Array.from({ length: 300 }, (_, seed) => seed)

/** The distinct calls a level produced from SEEDS, written "coverage/pressure". */
function callsAt(level: Level): string[] {
  const calls = SEEDS.map((seed) => generatePlay(seed, { level }).defense.call)
  return [...new Set(calls.map(({ coverage, pressure }) => `${coverage}/${pressure}`))]
}

describe('generatePlay', () => {
  it('builds the same play from the same seed', () => {
    expect(generatePlay(42, { level: 'pro' })).toEqual(generatePlay(42, { level: 'pro' }))
  })

  it('gives a rookie only the five basic coverages, without simulated pressure or a fire zone', () => {
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
    expect(rookieCalls).toEqual(expect.arrayContaining(callsAt('rookie')))
  })

  it.each(['starter', 'pro'] as Level[])(
    'pairs each coverage only with a pressure it can be played with at the %s level',
    (level) => {
      const playable = COVERAGE_IDS.flatMap((coverage) =>
        COVERAGES[coverage].pressures.map((pressure) => `${coverage}/${pressure}`),
      )
      expect(playable).toEqual(expect.arrayContaining(callsAt(level)))
    },
  )

  it.each(['rookie', 'starter'] as Level[])(
    'lines the defense up in what it plays at the %s level',
    (level) => {
      const calls = SEEDS.map((seed) => generatePlay(seed, { level }).defense.call)
      const disguised = calls.filter(
        ({ coverage, look }) =>
          look.shell !== COVERAGES[coverage].shell ||
          look.cornersDisguised ||
          look.manHidden ||
          look.mug,
      )
      expect(disguised).toEqual([])
    },
  )

  it('never motions at the rookie level', () => {
    const withMotion = SEEDS.filter((seed) => generatePlay(seed, { level: 'rookie' }).motion)
    expect(withMotion).toEqual([])
  })

  it('keeps choices a study session fixes', () => {
    const play = generatePlay(5, {
      level: 'pro',
      coverage: 'cover6',
      concept: 'smash',
      formation: 'bunch',
    })
    expect([play.defense.call.coverage, play.concept, play.formation.id]).toEqual([
      'cover6',
      'smash',
      'bunch',
    ])
  })

  it('never puts the Bears on both sides of the ball', () => {
    const play = generatePlay(3, { level: 'starter', team: 'CHI' })
    expect(play.situation.defense).toBe('CHI')
    expect(play.situation.offense).not.toBe('CHI')
  })
})

describe('generatePlay from a real snap', () => {
  const snap: RealSnap = {
    id: 0,
    season: 2025,
    week: 7,
    offense: 'DET',
    defense: 'CHI',
    down: 3,
    distance: 6,
    yardsToGoal: 34,
    coverage: 'cover3',
    pressure: 'blitz',
    rushers: 5,
    blitzers: 2,
    motion: true,
    personnel: '11',
    hash: -1,
  }

  it('keeps the snap’s situation, call, personnel and motion', () => {
    // Act
    const play = generatePlay(3, { level: 'starter', snap })

    // Assert
    expect(play.situation).toEqual({
      down: 3,
      distance: 6,
      yardLine: 66,
      offense: 'DET',
      defense: 'CHI',
    })
    expect(play.defense.call).toMatchObject({ coverage: 'cover3', pressure: 'blitz' })
    expect(FORMATIONS[play.formation.id].personnel).toBe('11')
    expect(play.motion).not.toBeNull()
  })

  it('leaves out motion at a level that does not teach it', () => {
    // Arrange: Cover 3 with a blitz is a fire zone, which a rookie does not see.
    const rookieSnap: RealSnap = { ...snap, pressure: 'four' }

    // Act
    const withMotion = SEEDS.filter(
      (seed) => generatePlay(seed, { level: 'rookie', snap: rookieSnap }).motion,
    )

    // Assert
    expect(withMotion).toEqual([])
  })
})

describe('simulate', () => {
  it('ends the motion on the formation spot at the snap', () => {
    // Arrange
    const request = { level: 'starter', formation: 'trips' } as const
    const play = SEEDS.map((seed) => generatePlay(seed, request)).find((p) => p.motion)
    if (!play?.motion) throw new Error('No seed gave a trips play with motion')
    const mover = play.motion.player
    const spot = player(play.formation, mover).pos
    expect(distance(play.motion.from, spot)).toBeGreaterThan(1)

    // Act
    const { frames, snap } = simulate(play)

    // Assert
    expect(distance(frames[snap].offense[mover], spot)).toBeLessThan(0.01)
  })

  it('keeps each man defender within 4 yards of his receiver to the end of the play', () => {
    // Arrange
    const play = generatePlay(3, { level: 'starter', coverage: 'cover1', concept: 'fourVerts' })

    // Act
    const { frames } = simulate(play)

    // Assert
    const end = frames[frames.length - 1]
    const gaps = play.defense.players.flatMap((d) =>
      d.assignment.kind === 'man'
        ? [distance(end.defense[d.id], end.offense[d.assignment.target])]
        : [],
    )
    expect(gaps).not.toHaveLength(0)
    expect(Math.max(...gaps)).toBeLessThan(4)
  })
})

describe('mark', () => {
  it('marks the coverage, the rush, man or zone, and the deep safeties separately', () => {
    // Arrange
    const play = generatePlay(9, { level: 'starter', coverage: 'cover3', pressure: 'four' })
    expect(play.defense.call).toMatchObject({ coverage: 'cover3', pressure: 'four' })

    // Act
    const rightCoverage = mark(play, { coverage: 'cover3', pressure: 'sim' })
    const rightRush = mark(play, { coverage: 'cover1', pressure: 'four' })

    // Assert
    expect(rightCoverage).toEqual({ coverage: true, pressure: false, family: true, shell: true })
    expect(rightRush).toEqual({ coverage: false, pressure: true, family: false, shell: true })
  })
})

describe('record', () => {
  it('tallies the coverage and the rush separately and counts a streak only while both are right', () => {
    // Arrange
    const play = generatePlay(9, { level: 'starter', coverage: 'cover3', pressure: 'four' })
    const both: Marks = { coverage: true, pressure: true, family: true, shell: true }
    const coverageOnly: Marks = { ...both, pressure: false }

    // Act
    const stats = record(record(EMPTY_STATS, play, both), play, coverageOnly)

    // Assert
    expect(stats).toEqual({
      plays: 2,
      streak: 0,
      best: 1,
      coverage: { cover3: { seen: 2, right: 2 } },
      pressure: { four: { seen: 2, right: 1 } },
    })
  })
})
