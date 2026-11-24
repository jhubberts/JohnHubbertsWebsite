/**
 * Real NFL dropbacks, with the coverage and rush FTN charted for each. The Film Room draws the
 * players itself; the situation, teams, personnel, motion, hash and the defense's call are the
 * real snap's. tools/film-room/build_snaps.py writes the files, which are fetched only when asked
 * for: the snaps (about 240 KB compressed) and, after a reveal, one defense's play descriptions.
 */

import { COVERAGES, type CoverageId, type PressureId } from './defense'
import type { Personnel } from './offense'
import { LEVELS, pressuresWith, type Level, type Situation } from './play'
import { createRandom } from './random'

export interface RealSnap {
  /** The snap's row in the file, which keys its play description. */
  id: number
  season: number
  week: number
  offense: string
  defense: string
  down: Situation['down']
  distance: number
  /** Yards from the offense to the end zone it is attacking. */
  yardsToGoal: number
  coverage: CoverageId
  pressure: PressureId
  rushers: number
  /** Rushers who are not defensive linemen. */
  blitzers: number
  motion: boolean
  /** The offense's personnel, folded into the three groups the Film Room draws. */
  personnel: Personnel
  /** The ball's spot: the left hash, the middle, or the right hash. */
  hash: -1 | 0 | 1
}

interface SnapFile {
  coverages: CoverageId[]
  pressures: PressureId[]
  /** The name of each column in a row. */
  fields: string[]
  snaps: (string | number)[][]
}

/** Turns the file's rows, which keep fields by column to stay small, into snaps. */
export function decodeSnaps(file: SnapFile): RealSnap[] {
  const column = Object.fromEntries(file.fields.map((field, index) => [field, index]))
  return file.snaps.map((row, id) => {
    const at = (field: string) => row[column[field]]
    return {
      id,
      season: Number(at('season')),
      week: Number(at('week')),
      offense: String(at('offense')),
      defense: String(at('defense')),
      down: Number(at('down')) as RealSnap['down'],
      distance: Number(at('distance')),
      yardsToGoal: Number(at('yardsToGoal')),
      coverage: file.coverages[Number(at('coverage'))],
      pressure: file.pressures[Number(at('pressure'))],
      rushers: Number(at('rushers')),
      blitzers: Number(at('blitzers')),
      motion: at('motion') === 1,
      personnel: String(at('personnel')) as Personnel,
      hash: Number(at('hash')) as RealSnap['hash'],
    }
  })
}

/** Fetches JSON once per page load; a failed fetch can be tried again. */
function fetchOnce<T>(url: string, cache: Map<string, Promise<T>>): Promise<T> {
  let request = cache.get(url)
  if (!request) {
    request = fetch(url).then((response) => {
      if (!response.ok) throw new Error(`${url} did not load (${response.status})`)
      return response.json() as Promise<T>
    })
    request.catch(() => cache.delete(url))
    cache.set(url, request)
  }
  return request
}

const snapFiles = new Map<string, Promise<SnapFile>>()
const descriptionFiles = new Map<string, Promise<Record<string, string>>>()

export async function loadRealSnaps(): Promise<RealSnap[]> {
  return decodeSnaps(await fetchOnce('/film-room/real-snaps.json', snapFiles))
}

/** The play-by-play text of a snap, such as "(Shotgun) 18-C.Williams pass short right…". */
export async function loadDescription(snap: RealSnap): Promise<string> {
  const texts = await fetchOnce(`/film-room/plays/${snap.defense}.json`, descriptionFiles)
  return texts[snap.id] ?? ''
}

/**
 * The snaps a quiz at `level` can draw from: one defense's, or every team's when `team` is
 * undefined, keeping only calls the level teaches.
 */
export function snapsFor(snaps: RealSnap[], team: string | undefined, level: Level): RealSnap[] {
  const { coverages } = LEVELS[level]
  return snaps.filter(
    (snap) =>
      (!team || snap.defense === team) &&
      coverages.includes(snap.coverage) &&
      pressuresWith(snap.coverage, level).includes(snap.pressure),
  )
}

/** The snap a seed picks from a pool. The same seed always picks the same one. */
export function snapForSeed(pool: RealSnap[], seed: number): RealSnap | undefined {
  return pool.length ? createRandom(seed).pick(pool) : undefined
}

/** "2025 Week 7" or "2024 playoffs", the way a broadcast dates a game. */
export function snapDate(snap: RealSnap): string {
  return snap.week > 18 ? `${snap.season} playoffs` : `${snap.season} Week ${snap.week}`
}

/** What FTN charted, in words: "Cover 3, 5 rushers (2 blitzers)". */
export function chartedCall(snap: RealSnap): string {
  const rush = `${snap.rushers} rusher${snap.rushers === 1 ? '' : 's'}`
  const blitz = snap.blitzers ? ` (${snap.blitzers} blitzer${snap.blitzers === 1 ? '' : 's'})` : ''
  return `${COVERAGES[snap.coverage].name}, ${rush}${blitz}`
}
