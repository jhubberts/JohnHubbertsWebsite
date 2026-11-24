import { describe, expect, it } from 'vitest'
import { compactProgress } from './series-bar-form'

describe('compactProgress', () => {
  const parts = Array.from({ length: 12 }, (_, n) => n)

  it('names the open chapter and counts the read chapters of the series', () => {
    expect(compactProgress(parts, new Set([0, 1, 2, 3]), 11)).toBe('Chapter 11 · 4 of 12 read')
  })

  it('ignores read chapters that are not in the series', () => {
    expect(compactProgress(parts, new Set([0, 40]), 1)).toBe('Chapter 1 · 1 of 12 read')
  })
})
