import { describe, expect, it } from 'vitest'
import { seatDetails, seatPeople } from './lineups'
import { generatePlay } from './play'
import type { Person } from './real-snaps'

const person = (name: string, position: string): Person => ({ name, number: 1, position })

const offense = [
  person('Center', 'C'),
  person('Guard 1', 'G'),
  person('Guard 2', 'G'),
  person('Quarterback', 'QB'),
  person('Back', 'RB'),
  person('Tackle 1', 'T'),
  person('Tackle 2', 'T'),
  person('Tight end', 'TE'),
  person('Receiver 1', 'WR'),
  person('Receiver 2', 'WR'),
  person('Receiver 3', 'WR'),
]
const defense = [
  person('Corner 1', 'CB'),
  person('Corner 2', 'CB'),
  person('Corner 3', 'CB'),
  person('End 1', 'DE'),
  person('End 2', 'DE'),
  person('Tackle 1', 'DT'),
  person('Tackle 2', 'DT'),
  person('Free safety', 'FS'),
  person('Inside backer', 'ILB'),
  person('Middle backer', 'MLB'),
  person('Strong safety', 'SS'),
]

describe('seatPeople', () => {
  const play = generatePlay(1, { level: 'starter', formation: 'doublesTe', coverage: 'cover3' })
  const seats = seatPeople(play, { description: '', offense, defense })

  it('puts each player in a spot his position plays', () => {
    expect(seats.QB?.position).toBe('QB')
    expect(seats.Y?.position).toBe('TE')
    expect([seats.X, seats.Z, seats.H].map((p) => p?.position)).toEqual(['WR', 'WR', 'WR'])
    expect([seats.LT, seats.RT].map((p) => p?.position)).toEqual(['T', 'T'])
    expect([seats.FS?.position, seats.SS?.position]).toEqual(['FS', 'SS'])
    expect([seats.CB_S, seats.CB_W, seats.NB].map((p) => p?.position)).toEqual(['CB', 'CB', 'CB'])
    expect(seats.MIKE?.position).toBe('MLB')
  })

  it('places all eleven on each side', () => {
    const placed = Object.values(seats)
    expect(new Set(placed).size).toBe(22)
  })

  it('leaves a spot empty, not anyone placed twice, when the charting lists ten', () => {
    const short = seatPeople(play, { description: '', offense: offense.slice(1), defense })
    const placed = Object.values(short)
    expect(placed.length).toBe(21)
    expect(new Set(placed).size).toBe(21)
  })
})

describe('seatDetails', () => {
  const play = generatePlay(1, { level: 'starter', formation: 'doublesTe', coverage: 'cover3' })
  const hidden = { routes: false, coverage: false }
  const shown = { routes: true, coverage: true }

  it('names a real player and the spot he is drawn in', () => {
    const lines = seatDetails(play, 'QB', person('Caleb Williams', 'QB'), hidden)
    expect(lines).toEqual(['#1 Caleb Williams (QB)', 'Drawn as: Quarterback'])
  })

  it('keeps a defender’s assignment hidden until the coverage layer is on', () => {
    expect(seatDetails(play, 'FS', undefined, hidden)).toEqual(['Free safety'])
    expect(seatDetails(play, 'FS', undefined, { routes: true, coverage: false })).toEqual([
      'Free safety',
    ])
    expect(seatDetails(play, 'FS', undefined, shown)).toEqual([
      'Free safety',
      'Zone: Deep middle ⅓',
    ])
  })

  it('shows a receiver’s route only when the routes layer is on', () => {
    expect(seatDetails(play, 'X', undefined, hidden)).toHaveLength(1)
    expect(seatDetails(play, 'X', undefined, shown)[1]).toMatch(/^Route: /)
  })
})
