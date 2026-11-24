/**
 * The areas of the field a zone defender is responsible for. Zones are fixed to the field, not
 * to the ball: a deep third is a third of the field's width wherever the ball is spotted.
 */

import { FIELD_WIDTH as W, MIDDLE, type Point, type Side } from './field'

export type ZoneId =
  | 'deepThirdL'
  | 'deepThirdM'
  | 'deepThirdR'
  | 'deepHalfL'
  | 'deepHalfR'
  | 'deepQuarterL'
  | 'deepQuarterLM'
  | 'deepQuarterRM'
  | 'deepQuarterR'
  | 'flatL'
  | 'flatR'
  | 'curlFlatL'
  | 'curlFlatR'
  | 'hookL'
  | 'hookR'
  | 'hookM'
  | 'hookCurlL'
  | 'hookCurlR'
  | 'hole'
  | 'tampaMiddle'

export interface Zone {
  label: string
  deep: boolean
  /** Left and right edges, in yards from the offense's left sideline. */
  x: [number, number]
  /** Near and far edges, in yards downfield from the line of scrimmage. */
  y: [number, number]
  /** Where the defender drops to before he reacts to receivers. */
  landmark: Point
}

/** The depth the deep thirds, halves and quarters cover, in yards from the line of scrimmage. */
const DEEP_Y: [number, number] = [12, 30]

export const ZONES: Record<ZoneId, Zone> = {
  deepThirdL: {
    label: 'Deep ⅓',
    deep: true,
    x: [0, W / 3],
    y: DEEP_Y,
    landmark: { x: W / 6, y: 16 },
  },
  deepThirdM: {
    label: 'Deep middle ⅓',
    deep: true,
    x: [W / 3, (2 * W) / 3],
    y: DEEP_Y,
    landmark: { x: MIDDLE, y: 17 },
  },
  deepThirdR: {
    label: 'Deep ⅓',
    deep: true,
    x: [(2 * W) / 3, W],
    y: DEEP_Y,
    landmark: { x: (5 * W) / 6, y: 16 },
  },
  deepHalfL: { label: 'Deep ½', deep: true, x: [0, MIDDLE], y: DEEP_Y, landmark: { x: 15, y: 17 } },
  deepHalfR: {
    label: 'Deep ½',
    deep: true,
    x: [MIDDLE, W],
    y: DEEP_Y,
    landmark: { x: W - 15, y: 17 },
  },
  deepQuarterL: {
    label: 'Deep ¼',
    deep: true,
    x: [0, W / 4],
    y: DEEP_Y,
    landmark: { x: 7, y: 15 },
  },
  deepQuarterLM: {
    label: 'Deep ¼',
    deep: true,
    x: [W / 4, MIDDLE],
    y: DEEP_Y,
    landmark: { x: 20, y: 15 },
  },
  deepQuarterRM: {
    label: 'Deep ¼',
    deep: true,
    x: [MIDDLE, (3 * W) / 4],
    y: DEEP_Y,
    landmark: { x: W - 20, y: 15 },
  },
  deepQuarterR: {
    label: 'Deep ¼',
    deep: true,
    x: [(3 * W) / 4, W],
    y: DEEP_Y,
    landmark: { x: W - 7, y: 15 },
  },
  flatL: { label: 'Flat', deep: false, x: [0, 13], y: [-1, 8], landmark: { x: 8, y: 5 } },
  flatR: { label: 'Flat', deep: false, x: [W - 13, W], y: [-1, 8], landmark: { x: W - 8, y: 5 } },
  curlFlatL: { label: 'Curl/Flat', deep: false, x: [3, 17], y: [1, 12], landmark: { x: 12, y: 8 } },
  curlFlatR: {
    label: 'Curl/Flat',
    deep: false,
    x: [W - 17, W - 3],
    y: [1, 12],
    landmark: { x: W - 12, y: 8 },
  },
  hookL: { label: 'Hook', deep: false, x: [17, MIDDLE], y: [3, 12], landmark: { x: 21.5, y: 8 } },
  hookR: {
    label: 'Hook',
    deep: false,
    x: [MIDDLE, W - 17],
    y: [3, 12],
    landmark: { x: W - 21.5, y: 8 },
  },
  hookM: {
    label: 'Middle hook',
    deep: false,
    x: [21, W - 21],
    y: [3, 12],
    landmark: { x: MIDDLE, y: 8.5 },
  },
  hookCurlL: {
    label: 'Hook/Curl',
    deep: false,
    x: [11, 22],
    y: [3, 13],
    landmark: { x: 17, y: 9 },
  },
  hookCurlR: {
    label: 'Hook/Curl',
    deep: false,
    x: [W - 22, W - 11],
    y: [3, 13],
    landmark: { x: W - 17, y: 9 },
  },
  hole: {
    label: 'Hole (robber)',
    deep: false,
    x: [20, W - 20],
    y: [7, 15],
    landmark: { x: MIDDLE, y: 11 },
  },
  tampaMiddle: {
    label: 'Tampa middle',
    deep: true,
    x: [19, W - 19],
    y: [11, 24],
    landmark: { x: MIDDLE, y: 16 },
  },
}

/** The kinds of zone that `zoneOn` picks by side, each as [left, right]. */
const SIDED = {
  deepThird: ['deepThirdL', 'deepThirdR'],
  deepHalf: ['deepHalfL', 'deepHalfR'],
  deepQuarter: ['deepQuarterL', 'deepQuarterR'],
  deepQuarterInner: ['deepQuarterLM', 'deepQuarterRM'],
  flat: ['flatL', 'flatR'],
} as const satisfies Record<string, [ZoneId, ZoneId]>

/** The zone of a kind on the offense's left or right. */
export function zoneOn(kind: keyof typeof SIDED, side: Side): ZoneId {
  return SIDED[kind][side < 0 ? 0 : 1]
}

/** True when `p` lies inside the zone's area, edges included. */
export function inZone(zone: ZoneId, p: Point): boolean {
  const z = ZONES[zone]
  return p.x >= z.x[0] && p.x <= z.x[1] && p.y >= z.y[0] && p.y <= z.y[1]
}
