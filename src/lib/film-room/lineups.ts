/**
 * Puts a real snap's players into the spots the Film Room draws. The charting says who was on
 * the field and their roster positions, not where each one lined up, so each spot takes a player
 * of the position that usually plays it: the quarterback at quarterback, a cornerback at corner,
 * and so on. Which of two receivers is X and which is Z is a guess.
 */

import { DEFENDERS, type DefenseId } from './defense'
import { player, spotName, type OffenseId, type OffenseRole } from './offense'
import type { Play } from './play'
import type { Person, SnapDetails } from './real-snaps'
import { ROUTES } from './routes'
import { ZONES } from './zones'

export type Seat = OffenseId | DefenseId

/** Roster positions that fit an offensive spot, best first. */
function offensePreferences(id: OffenseId, role: OffenseRole): string[] {
  switch (id) {
    case 'QB':
      return ['QB']
    case 'C':
      return ['C', 'G', 'T']
    case 'LG':
    case 'RG':
      return ['G', 'C', 'T']
    case 'LT':
    case 'RT':
      return ['T', 'G', 'C']
    case 'FB':
      return ['FB', 'RB', 'TE']
    case 'RB':
      return ['RB', 'FB', 'WR']
    default:
      return role === 'tightEnd' ? ['TE', 'FB', 'WR'] : ['WR', 'TE', 'RB']
  }
}

/** Roster positions that fit each defensive spot, best first, in the order spots are filled. */
const DEFENSE_PREFERENCES: [DefenseId, string[]][] = [
  ['FS', ['FS', 'SS', 'S', 'CB']],
  ['SS', ['SS', 'FS', 'S', 'CB']],
  ['CB_S', ['CB', 'DB']],
  ['CB_W', ['CB', 'DB']],
  ['NB', ['CB', 'DB', 'SS', 'FS', 'S']],
  ['DB', ['CB', 'DB', 'SS', 'FS', 'S']],
  ['DT_S', ['DT', 'NT', 'DE']],
  ['DT_W', ['DT', 'NT', 'DE']],
  ['DE_S', ['DE', 'OLB', 'DT']],
  ['DE_W', ['DE', 'OLB', 'DT']],
  ['MIKE', ['MLB', 'ILB', 'LB', 'OLB']],
  ['WILL', ['ILB', 'MLB', 'LB', 'OLB']],
  ['SAM', ['OLB', 'ILB', 'LB', 'MLB']],
]

/** The offensive spots in the order they are filled: the line and backs, then the receivers. */
const OFFENSE_ORDER: OffenseId[] = [
  'QB',
  'C',
  'LT',
  'RT',
  'LG',
  'RG',
  'FB',
  'RB',
  'Y',
  'H',
  'X',
  'Z',
]

/**
 * Gives each spot the first unplaced player whose position it prefers, then fills any spot still
 * empty with whoever is left, so all eleven are always placed.
 */
function fill<S extends Seat>(
  seats: [S, string[]][],
  people: Person[],
  out: Partial<Record<Seat, Person>>,
) {
  const left = [...people]
  const empty: S[] = []
  for (const [seat, preferred] of seats) {
    const index = preferred
      .map((position) => left.findIndex((p) => p.position === position))
      .find((i) => i >= 0)
    if (index === undefined) {
      empty.push(seat)
      continue
    }
    out[seat] = left.splice(index, 1)[0]
  }
  for (const seat of empty) {
    const person = left.shift()
    if (person) out[seat] = person
  }
}

/** Which real player stands in each drawn spot. */
export function seatPeople(play: Play, details: SnapDetails): Partial<Record<Seat, Person>> {
  const out: Partial<Record<Seat, Person>> = {}
  const offense = OFFENSE_ORDER.flatMap((id) => {
    const spot = play.formation.players.find((p) => p.id === id)
    return spot ? [[id, offensePreferences(id, spot.role)] as [OffenseId, string[]]] : []
  })
  fill(offense, details.offense, out)
  const onField = new Set(play.defense.players.map((d) => d.id))
  fill(
    DEFENSE_PREFERENCES.filter(([id]) => onField.has(id)),
    details.defense,
    out,
  )
  return out
}

/** What a drawn spot is, such as "Z receiver (flanker, off the line)" or "Free safety". */
export function seatName(play: Play, seat: Seat): string {
  if (seat in DEFENDERS) return DEFENDERS[seat as DefenseId].name
  return spotName(player(play.formation, seat as OffenseId))
}

/** What a player does after the snap: his route, or the defender's assignment. */
export function seatJob(play: Play, seat: Seat): string | null {
  const route = play.routes[seat as OffenseId]
  if (route)
    return route.route === 'block' ? 'Stays in to block' : `Route: ${ROUTES[route.route].name}`
  const defender = play.defense.players.find((d) => d.id === seat)
  if (!defender) return null
  const a = defender.assignment
  if (a.kind === 'rush') return 'Rushes the passer'
  if (a.kind === 'man') return `Man coverage on the ${seatName(play, a.target)}`
  return `Zone: ${ZONES[a.zone].label}`
}

/** "#31 Kevin Byard (FS)". */
export function personLine(person: Person): string {
  const number = person.number === null ? '' : `#${person.number} `
  return `${number}${person.name} (${person.position})`
}

/**
 * The lines to show for a player pointed at: who he is (or what his spot is, on a made-up play),
 * and his job after the snap, but only when the layer showing it is on, so it never gives the
 * coverage away before the reader asks to see it.
 */
export function seatDetails(
  play: Play,
  seat: Seat,
  person: Person | undefined,
  showing: { routes: boolean; coverage: boolean },
): string[] {
  const lines = person
    ? [personLine(person), `Drawn as: ${seatName(play, seat)}`]
    : [seatName(play, seat)]
  const isOffense = play.formation.players.some((p) => p.id === seat)
  const job = (isOffense ? showing.routes : showing.coverage) ? seatJob(play, seat) : null
  return job ? [...lines, job] : lines
}
