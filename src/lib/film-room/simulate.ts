/**
 * Moves the 22 players through a play, frame by frame: the pre-snap motion, then about three
 * seconds after the snap. Every frame is worked out up front, so the picture can be scrubbed
 * back and forth to any frame.
 */

import { alignDefense, type DefenseId, type DefensivePlayer } from './defense'
import { alongPath, clamp, deepestY, distance, lerp, stepToward, type Point } from './field'
import { beforeMotion, type OffenseId, type OffensivePlayer } from './offense'
import type { Play } from './play'
import { ROUTES, routePath } from './routes'
import { ZONES, inZone } from './zones'

export interface Frame {
  /** Seconds from the snap; negative before it. */
  t: number
  offense: Record<OffenseId, Point>
  defense: Record<DefenseId, Point>
}

export interface Timeline {
  frames: Frame[]
  /** Index of the frame at the snap. */
  snap: number
  /** Seconds between frames. */
  dt: number
  /** Each route runner's path from his spot at the snap, kept inside the end line. */
  routes: Partial<Record<OffenseId, Point[]>>
  /** Where each zone defender drops to before he reacts, kept inside the end line. */
  landmarks: Partial<Record<DefenseId, Point>>
}

const DT = 1 / 30
/** Seconds everyone stands still at the start, before the motion or the snap. */
const HOLD = 0.6
const MOTION_TIME = 1.8
/** Seconds the play runs after the snap. */
const PLAY_TIME = 3.2

const smooth = (p: number) => p * p * (3 - 2 * p)

/**
 * Yards run `t` seconds after starting, speeding up evenly to `speed` yards a second over the
 * first 0.4 seconds.
 */
function travelled(t: number, speed: number): number {
  if (t <= 0) return 0
  return t < 0.4 ? (speed * t * t) / 0.8 : speed * (t - 0.2)
}

/** Where offensive player `p` is `t` seconds after the snap. */
function offenseAfterSnap(
  play: Play,
  p: OffensivePlayer,
  t: number,
  path: Point[] | undefined,
): Point {
  const start = p.pos
  if (p.role === 'line') {
    // Linemen step back a yard into pass protection over 0.4 seconds; the tackles also slide
    // 0.6 yards outward.
    const set = Math.min(t / 0.4, 1)
    const kick = p.id === 'LT' ? -0.6 : p.id === 'RT' ? 0.6 : 0
    return { x: start.x + kick * set, y: start.y - set }
  }
  if (p.role === 'qb') {
    // A quarterback under center (closer than 2 yards to the line) takes longer to drop back.
    const dropTime = start.y > -2 ? 1.2 : 0.8
    return lerp(start, { x: start.x, y: -7.5 }, smooth(Math.min(t / dropTime, 1)))
  }
  const assignment = play.routes[p.id]
  if (!assignment || !path) return start
  const speed = p.role === 'receiver' ? 7.6 : p.role === 'tightEnd' ? 6.6 : 6.8
  return alongPath(path, travelled(t - (ROUTES[assignment.route].delay ?? 0.05), speed))
}

function defenderSpeed(d: DefensivePlayer): number {
  if (d.role === 'line') return 4.5
  if (d.role === 'linebacker') return 5.9
  return 6.9
}

/**
 * Moves defender `d` one frame on from `pos`, following his assignment against the offense's
 * positions `t` seconds after the snap.
 */
function defenseStep(
  play: Play,
  d: DefensivePlayer,
  pos: Point,
  t: number,
  offense: Record<OffenseId, Point>,
  mark: Point,
  deepest: number,
): Point {
  const assignment = d.assignment
  const qb = offense.QB
  if (assignment.kind === 'rush') {
    if (d.role === 'line') {
      const push = t > 1.2 ? -1.7 : -0.9
      const target = { x: pos.x + (qb.x - pos.x) * 0.04, y: push }
      return stepToward(pos, target, 3.5 * DT)
    }
    if (distance(pos, qb) < 1.4) return pos
    return stepToward(pos, qb, 6.6 * DT)
  }
  if (assignment.kind === 'man') {
    if (t < 0.05) return pos
    // Stay on the receiver's inside shoulder, underneath him when trailing and over him otherwise.
    const target = offense[assignment.target]
    const side = Math.sign(target.x - play.formation.ballX) || 1
    const want = {
      x: target.x - side * 0.7,
      y: Math.max(0.8, target.y + (assignment.trail ? -0.6 : 0.8)),
    }
    return stepToward(pos, want, 8.2 * DT)
  }
  if (t < 0.15) return pos
  // Head for the zone's landmark, shifted toward the route runner in the zone who is nearest it:
  // a deep defender keeps 2 yards deeper than him, and a short one moves part of the way to him.
  const zone = ZONES[assignment.zone]
  let want = mark
  let nearest: Point | null = null
  for (const [id, runner] of Object.entries(offense) as [OffenseId, Point][]) {
    const route = play.routes[id]
    if (!route || route.route === 'block' || !inZone(assignment.zone, runner)) continue
    if (!nearest || distance(runner, mark) < distance(nearest, mark)) nearest = runner
  }
  if (nearest) {
    want = zone.deep
      ? {
          x: mark.x + clamp((nearest.x - mark.x) * 0.6, -6, 6),
          y: Math.max(mark.y - 2, nearest.y + 2),
        }
      : {
          x: mark.x + clamp((nearest.x - mark.x) * 0.45, -3.5, 3.5),
          y: mark.y + clamp((nearest.y - mark.y) * 0.45, -3, 3),
        }
  }
  return stepToward(pos, { x: want.x, y: Math.min(want.y, deepest) }, defenderSpeed(d) * DT)
}

/**
 * Works out every frame of a play, `DT` seconds apart: everyone still for `HOLD` seconds, the
 * motion if there is one, the snap at `t = 0`, and `PLAY_TIME` seconds after it.
 */
export function simulate(play: Play): Timeline {
  const { formation, motion, defense } = play
  // Near the goal line nobody lines up, runs or drops past the back of the end zone.
  const deepest = deepestY(play.situation.yardLine)
  const inside = (p: Point): Point => ({ x: p.x, y: Math.min(p.y, deepest) })
  const alignedBefore = alignDefense(defense, beforeMotion(formation, motion))
  const alignedAtSnap = alignDefense(defense, formation)
  const routes: Timeline['routes'] = {}
  for (const p of formation.players) {
    const assignment = play.routes[p.id]
    if (assignment) routes[p.id] = routePath(assignment.route, p.pos, assignment.side, deepest)
  }
  const landmarks: Timeline['landmarks'] = {}
  for (const d of defense.players) {
    if (d.assignment.kind === 'zone') landmarks[d.id] = inside(ZONES[d.assignment.zone].landmark)
  }
  const start = motion ? -(HOLD + MOTION_TIME) : -HOLD
  const frames: Frame[] = []

  /** How far through the motion the play is at time `t`, from 0 to 1 (1 with no motion). */
  const motionProgress = (t: number) =>
    motion ? smooth(clamp((t - start - HOLD) / MOTION_TIME, 0, 1)) : 1

  const steps = Math.round((PLAY_TIME - start) / DT)
  const snap = Math.round(-start / DT)
  let defensePos = {} as Record<DefenseId, Point>
  for (let i = 0; i <= steps; i++) {
    const t = start + i * DT
    if (i <= snap) {
      const progress = motionProgress(t)
      const offense = {} as Record<OffenseId, Point>
      for (const p of formation.players) offense[p.id] = p.pos
      if (motion) offense[motion.player] = lerp(motion.from, offense[motion.player], progress)
      // A defender lined up over his man moves with him; the rest slide from where they lined up
      // against the formation before the motion to where they line up at the snap.
      defensePos = {} as Record<DefenseId, Point>
      for (const d of defense.players) {
        const { pos, follows } = alignedAtSnap[d.id]
        defensePos[d.id] = inside(
          follows
            ? { x: offense[follows.target].x + follows.dx, y: pos.y }
            : lerp(alignedBefore[d.id].pos, pos, progress),
        )
      }
      frames.push({ t, offense, defense: defensePos })
      continue
    }
    const offense = {} as Record<OffenseId, Point>
    for (const p of formation.players) offense[p.id] = offenseAfterSnap(play, p, t, routes[p.id])
    const next = {} as Record<DefenseId, Point>
    for (const d of defense.players) {
      next[d.id] = defenseStep(
        play,
        d,
        defensePos[d.id],
        t,
        offense,
        landmarks[d.id] ?? defensePos[d.id],
        deepest,
      )
    }
    defensePos = next
    frames.push({ t, offense, defense: next })
  }
  return { frames, snap, dt: DT, routes, landmarks }
}
