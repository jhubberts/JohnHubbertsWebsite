import { describe, expect, it } from 'vitest'
import { alignDefense } from './defense'
import { EMPTY_STATS, loadStats, record, saveStats, tells } from './grading'
import { LEVEL_IDS, generatePlay } from './play'

function fakeStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial))
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  }
}

const throwing = {
  getItem: () => {
    throw new Error('blocked')
  },
  setItem: () => {
    throw new Error('blocked')
  },
}

describe('loadStats and saveStats', () => {
  it('brings back a saved record', () => {
    const storage = fakeStorage()
    const play = generatePlay(9, { level: 'starter', coverage: 'cover3', pressure: 'four' })
    const stats = record(EMPTY_STATS, play, {
      coverage: true,
      pressure: false,
      family: true,
      shell: true,
    })
    saveStats(stats, storage)
    expect(loadStats(storage)).toEqual(stats)
  })

  it.each([
    ['missing', fakeStorage()],
    ['blocked', throwing],
    ['not JSON', fakeStorage({ 'filmRoom.stats': '{' })],
    ['the wrong shape', fakeStorage({ 'filmRoom.stats': '{"plays":3,"coverage":null}' })],
  ])('starts an empty record when storage is %s', (_, storage) => {
    expect(loadStats(storage)).toEqual(EMPTY_STATS)
  })

  it('does not throw when storage refuses a save', () => {
    expect(() => saveStats(EMPTY_STATS, throwing)).not.toThrow()
  })
})

describe('tells', () => {
  const plays = LEVEL_IDS.flatMap((level) =>
    Array.from({ length: 400 }, (_, seed) => generatePlay(seed, { level })),
  )

  it('never leaves a gap where a name or number should be', () => {
    const lines = plays.flatMap(tells)
    expect(lines.filter((line) => /undefined|NaN/.test(line))).toEqual([])
  })

  it('says a defender ran with the motion exactly when the picture shows him following it', () => {
    const motionPlays = plays.filter((play) => play.motion)
    expect(motionPlays.length).toBeGreaterThan(50)
    const wrong = motionPlays.filter((play) => {
      const mover = play.motion!.player
      const aligned = alignDefense(play.defense, play.formation)
      const followed = Object.values(aligned).some((a) => a.follows?.target === mover)
      const saysFollowed = tells(play).some((line) => line.includes('ran across the formation'))
      return followed !== saysFollowed
    })
    expect(wrong).toEqual([])
  })
})
