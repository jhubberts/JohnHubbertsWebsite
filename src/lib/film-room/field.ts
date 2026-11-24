/**
 * Field coordinates shared by the whole Film Room. A point is measured in yards: `x` across the
 * field from the offense's left sideline, `y` downfield from the line of scrimmage (negative is in
 * the offense's backfield). The offense always moves up the screen, toward positive `y`.
 */

export interface Point {
  x: number
  y: number
}

/** The offense's left (-1) or right (1), seen from behind the quarterback. */
export type Side = -1 | 1

export const FIELD_WIDTH = 160 / 3
export const MIDDLE = FIELD_WIDTH / 2
/** NFL hash marks are 18 feet 6 inches apart, centred on the field. */
const HASH_HALF_GAP = 18.5 / 2 / 3
export const LEFT_HASH = MIDDLE - HASH_HALF_GAP
export const RIGHT_HASH = MIDDLE + HASH_HALF_GAP

/** The part of the field the picture shows, as yards from the line of scrimmage. */
export const VIEW_BEHIND = 10
export const VIEW_AHEAD = 30

/**
 * How far past the line of scrimmage the back of the end zone is, for a line at `yardLine`
 * (yards from the offense's own goal line). An end zone is 10 yards deep.
 */
export function endLine(yardLine: number): number {
  return 110 - yardLine
}

/** The deepest a player runs or drops: a yard inside the end line. */
export function deepestY(yardLine: number): number {
  return endLine(yardLine) - 1
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function lerp(a: Point, b: Point, t: number): Point {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
}

/** Moves `from` toward `to` by at most `step` yards. */
export function stepToward(from: Point, to: Point, step: number): Point {
  const d = distance(from, to)
  if (d <= step) return { ...to }
  return lerp(from, to, step / d)
}

export function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, value))
}

/** The point on the polyline `path` that lies `travelled` yards from its start. */
export function alongPath(path: Point[], travelled: number): Point {
  let left = Math.max(0, travelled)
  for (let i = 1; i < path.length; i++) {
    const leg = distance(path[i - 1], path[i])
    if (left <= leg) return lerp(path[i - 1], path[i], leg === 0 ? 0 : left / leg)
    left -= leg
  }
  return { ...path[path.length - 1] }
}
