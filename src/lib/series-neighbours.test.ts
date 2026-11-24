import { describe, expect, it } from 'vitest'
import { seriesNeighbours } from './series-neighbours'

const chapters = [
  { part: 0, title: 'Zero' },
  { part: 1, title: 'One' },
  { part: 2, title: 'Two' },
  { part: 4, title: 'Four' },
]

describe('seriesNeighbours', () => {
  it('gives the first chapter no previous chapter', () => {
    expect(seriesNeighbours(chapters, 0)).toEqual({ previous: undefined, next: chapters[1] })
  })

  it('gives a middle chapter the chapters on each side', () => {
    expect(seriesNeighbours(chapters, 1)).toEqual({ previous: chapters[0], next: chapters[2] })
  })

  it('gives the last chapter no next chapter', () => {
    expect(seriesNeighbours(chapters, 4)).toEqual({ previous: chapters[2], next: undefined })
  })

  it('gives a part missing from the list the nearest chapter on each side', () => {
    expect(seriesNeighbours(chapters, 3)).toEqual({ previous: chapters[2], next: chapters[3] })
  })
})
