import { describe, expect, it } from 'vitest'
import {
  FOLDED,
  SEQUENCE,
  UNFOLDED,
  VIEW,
  crossingLinks,
  distanceFromCentre,
  ease,
  linkLengths,
  positionsAt,
  segmentsCross,
} from './chain'

describe('the chain', () => {
  it('has 24 beads of both kinds', () => {
    expect(SEQUENCE).toHaveLength(24)
    expect(SEQUENCE.indexOf('avoiding')).toBe(8)
    expect(SEQUENCE.lastIndexOf('avoiding')).toBe(14)
    expect(SEQUENCE.filter((bead) => bead === 'avoiding')).toHaveLength(7)
    expect(UNFOLDED).toHaveLength(24)
    expect(FOLDED).toHaveLength(24)
  })

  it('stays inside the drawing with room for a bead', () => {
    for (const point of [...UNFOLDED, ...FOLDED]) {
      expect(point.x).toBeGreaterThan(10)
      expect(point.x).toBeLessThan(VIEW.width - 10)
      expect(point.y).toBeGreaterThan(10)
      expect(point.y).toBeLessThan(VIEW.height - 10)
    }
  })

  it('starts as a wave from left to right', () => {
    for (let i = 1; i < UNFOLDED.length; i++) {
      expect(UNFOLDED[i].x).toBeGreaterThan(UNFOLDED[i - 1].x)
    }
    expect(crossingLinks(UNFOLDED)).toEqual([])
  })
})

describe('the folded shape', () => {
  it('has links within 25% of each other in length', () => {
    const lengths = linkLengths(FOLDED)
    expect(Math.max(...lengths) / Math.min(...lengths)).toBeLessThan(1.25)
  })

  it('has no two links crossing', () => {
    expect(crossingLinks(FOLDED)).toEqual([])
  })

  it('has every water-avoiding bead closer to the middle than every water-loving bead', () => {
    const inside = FOLDED.filter((_, i) => SEQUENCE[i] === 'avoiding').map(distanceFromCentre)
    const outside = FOLDED.filter((_, i) => SEQUENCE[i] === 'loving').map(distanceFromCentre)
    expect(Math.max(...inside)).toBeLessThan(Math.min(...outside))
  })
})

describe('segmentsCross', () => {
  it('finds an X and not a T or two apart', () => {
    const p = { x: 0, y: 0 }
    expect(segmentsCross(p, { x: 2, y: 2 }, { x: 0, y: 2 }, { x: 2, y: 0 })).toBe(true)
    expect(segmentsCross(p, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 2, y: 1 })).toBe(false)
  })
})

describe('the fold', () => {
  it('eases from 0 to 1, slowly at both ends', () => {
    expect(ease(0)).toBe(0)
    expect(ease(0.5)).toBeCloseTo(0.5, 12)
    expect(ease(1)).toBe(1)
    expect(ease(0.1)).toBeLessThan(0.1)
    expect(ease(0.9)).toBeGreaterThan(0.9)
    expect(ease(2)).toBe(1)
  })

  it('starts at the wave and ends at the folded shape', () => {
    expect(positionsAt(0)).toEqual(UNFOLDED)
    positionsAt(1).forEach((point, i) => {
      expect(point.x).toBeCloseTo(FOLDED[i].x, 9)
      expect(point.y).toBeCloseTo(FOLDED[i].y, 9)
    })
  })
})
