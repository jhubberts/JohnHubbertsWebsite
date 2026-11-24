/**
 * Explanations shown to the reader: what each coverage and pressure is, how to spot it before the
 * snap and how it looks after, the mug look, and what the letters on the field stand for.
 */

import type { CoverageId, PressureId } from './defense'

export interface CoverageGuide {
  /** One or two sentences: what it is and how to tell it from its neighbours. */
  short: string
  /** Other names a broadcast might use. */
  aka: string
  what: string
  beforeSnap: string
  afterSnap: string
  weakSpots: string
  /** What the corners' alignment says, when they are not disguised. */
  cornerTell: string
}

export const COVERAGE_GUIDE: Record<CoverageId, CoverageGuide> = {
  cover0: {
    short:
      'Man on every receiver with nobody deep; everyone else rushes, usually six. All-or-nothing.',
    aka: 'Zero, all-out',
    what: 'Pure man-to-man with no deep safety. Every eligible receiver has a defender on him, and everybody else rushes, usually six.',
    beforeSnap:
      'Both safeties close to the line. Defenders lined up right over receivers, often pressed. Lots of bodies near the line.',
    afterSnap:
      'Nobody in the deep middle. Every defender turns and runs with a receiver; the rest come after the quarterback.',
    weakSpots:
      'Anything quick: slants, hot routes, a receiver who wins one-on-one. There is no help over the top.',
    cornerTell:
      'Corners pressed with inside leverage, nobody giving them room to bail: a man tell.',
  },
  cover1: {
    short:
      'Man on every receiver with one free safety deep in the middle. The spare defender rushes or sits in the short middle as a robber.',
    aka: 'Man-free, Cover 1 robber, Cover 1 rat',
    what: 'Man-to-man on the receivers with one free safety in the deep middle. The spare defender either rushes or sits in the short middle as a "robber" looking to jump a crossing route.',
    beforeSnap:
      "One high safety. Corners often press, with inside leverage (lined up on the receiver's inside shoulder). A defender runs across with motion.",
    afterSnap:
      'One safety in the deep middle; everybody else turns and runs with a receiver. One linebacker may sit at 10 yards in the middle.',
    weakSpots:
      'Crossing routes that make man defenders run through traffic (Mesh, Drive), double moves, and the far sideline the free safety cannot reach.',
    cornerTell:
      'Corners shaded to the inside of their receivers, pressed or a few yards off: a man tell.',
  },
  cover2: {
    short:
      'Zone: two safeties split the deep field in halves, five defenders play short zones, and the corners sit in the flats.',
    aka: 'Two-deep, Cover 2 zone',
    what: 'Two deep safeties split the deep field in halves; five defenders play short zones. The corners squat in the flats and jam the outside receivers.',
    beforeSnap: 'Two high safeties. Corners shallow, about 5 yards, lined up outside the receiver.',
    afterSnap:
      'Corners sink only a few yards and stay outside; safeties bail toward the sidelines. Linebackers drop to the hooks.',
    weakSpots:
      'The deep middle between the safeties, and the sideline between the squatting corner and the safety, 18 to 22 yards downfield. Smash attacks exactly that.',
    cornerTell:
      'Corners squatted at about 5 yards, outside their receivers: they are guarding the flats, a Cover 2 tell.',
  },
  tampa2: {
    short:
      'Cover 2, except the middle linebacker sprints deep down the middle to close the gap between the two safeties.',
    aka: 'Tampa 2',
    what: "Cover 2 with the middle linebacker sprinting deep down the middle to close the hole between the safeties. Named for Tony Dungy's Tampa Bay defense; Lovie Smith brought it to Chicago, where Brian Urlacher ran the middle.",
    beforeSnap: 'Identical to Cover 2. You usually cannot tell them apart until the snap.',
    afterSnap:
      'The Mike linebacker turns and runs straight back 15 to 20 yards in the middle of the field.',
    weakSpots: 'The seams just outside the Mike, and the short middle he leaves empty behind him.',
    cornerTell:
      'Corners squatted at about 5 yards, outside their receivers: a Cover 2 family tell.',
  },
  twoMan: {
    short:
      'Two safeties deep in halves, and man coverage underneath: each defender trails his receiver, knowing help is over the top.',
    aka: '2-Man, Cover 5, 2-man under',
    what: 'Two deep safeties in halves, and everyone underneath plays man. Because there is help over the top, the man defenders "trail": they sit on the receiver\'s hip, underneath him.',
    beforeSnap:
      'Two high safeties, corners pressed. A defender travels with motion. Common on third and long.',
    afterSnap:
      'Underneath defenders hug their receivers from below; both safeties bail to deep halves.',
    weakSpots:
      'Quarterback scrambles (every defender has his back turned), and routes that break away from the trailing defender, like outs and comebacks.',
    cornerTell:
      'Corners pressed with inside leverage: man coverage. If two safeties stay high after the snap, it is man underneath with help over the top.',
  },
  cover3: {
    short:
      'Zone: the two corners and a safety each take a deep third; four defenders play short zones. One high safety.',
    aka: 'Three-deep, Cover 3 sky or buzz',
    what: 'Three defenders split the deep field in thirds: both corners and the free safety. Four play short zones: two curl/flat defenders outside and two hook defenders inside.',
    beforeSnap:
      'One high safety. Corners off at 6 to 8 yards with outside leverage. The other safety walked down toward the strong side.',
    afterSnap:
      'Corners backpedal or turn and bail to the deep outside thirds. A safety drops into a short zone, and the free safety stays in the deep middle.',
    weakSpots:
      'The seams between zones, four verticals against three deep defenders, and three receivers to one side (Flood) against two defenders there.',
    cornerTell:
      'Corners off at about 7 yards with outside leverage: they are protecting deep thirds.',
  },
  cover4: {
    short:
      'Zone: the corners and both safeties each take a deep quarter; three play underneath. Hard to beat deep, softer short.',
    aka: 'Quarters',
    what: 'Four deep defenders, the corners and the safeties, each take a quarter of the deep field; three play underneath. In the NFL the safeties read the inside receiver and jump him if he breaks short, so they help against the run too.',
    beforeSnap:
      'Two high safeties, often a little shallower than in Cover 2, about 10 yards. Corners off, about 7 yards.',
    afterSnap: 'Corners and safeties all backpedal. Nobody squats in the flat.',
    weakSpots:
      'The flats and the short areas underneath. Stick and flat routes are open; deep shots are not.',
    cornerTell: 'Corners off about 7 yards and level with their receivers: a quarters look.',
  },
  cover6: {
    short:
      'Split field: Quarters (Cover 4) on one side, Cover 2 on the other. Look for one corner deep and one squatting.',
    aka: 'Quarter-quarter-half',
    what: 'Split-field coverage: Quarters on one side, usually toward the trips or the wide side of the field, and Cover 2 on the other. A quarter plus a quarter plus a half: 6.',
    beforeSnap:
      'Two high safeties. The tell is the corners: one off and deep, the other squatting shallow on the Cover 2 side.',
    afterSnap:
      'On the quarters side the corner bails; on the half side the corner sits in the flat and the safety takes the deep half.',
    weakSpots:
      "The Cover 2 side's hole between corner and safety, and the flats on the quarters side.",
    cornerTell: 'One corner off and one squatting shallow: split-field coverage, a Cover 6 tell.',
  },
}

/** Each rush: a one-line answer to "who comes after the quarterback?", and the fuller story. */
export const PRESSURE_GUIDE: Record<PressureId, { short: string; long: string }> = {
  four: {
    short: 'Only the four linemen rush; seven defenders drop into coverage.',
    long: 'The four down linemen rush and seven defenders drop into coverage.',
  },
  sim: {
    short:
      'Still four rushers, but one is a linebacker or defensive back, and a lineman drops into coverage instead.',
    long: 'Simulated pressure, or a "creeper": still four rushers, but not the four you expect. A linebacker or nickel rushes and a lineman drops into a short zone. The quarterback sees a blitz coming while seven defenders are still in coverage.',
  },
  blitz: {
    short: 'Five or more rushers, with at least one safety still deep behind them.',
    long: 'Five or more rushers with a safety still deep. Behind it is usually Cover 1 (man with one free safety) or a fire zone: three deep, three short, with a lineman often dropping into one of the short zones. Two-high defenses blitz too, leaving a short zone empty.',
  },
  zero: {
    short:
      'Cover 0: everyone not covering a receiver rushes, usually six, and nobody is deep. Blitz keeps a safety back; this does not.',
    long: 'Cover 0: pure man coverage with nobody deep, and everyone else rushing, usually six. The ball has to come out fast.',
  },
}

export const MUG_NOTE =
  'A "mug" look: linebackers walked up into the A-gaps, the spaces on each side of the center, so the defense shows six or seven players on the line. At the snap some of them rush and some back out into coverage. Brian Flores and Dennis Allen use it to make the offense guess.'

export const ROLE_LEGEND: [string, string][] = [
  ['E / T', 'Defensive end / tackle'],
  ['S M W', 'Sam, Mike and Will linebackers (strong side, middle, weak side)'],
  ['N / D', 'Nickel and dime backs (extra defensive backs, usually over the slot)'],
  ['C', 'Cornerback'],
  ['SS / FS', 'Strong safety / free safety'],
  ['X Z', 'Wide receivers (X on the line, Z off it)'],
  ['Y', 'Tight end, or the third receiver in some formations'],
  ['H', 'Slot receiver or second tight end'],
  ['RB / FB', 'Running back / fullback'],
]
