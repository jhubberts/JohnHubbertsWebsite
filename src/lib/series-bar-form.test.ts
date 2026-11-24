import { describe, expect, it } from 'vitest'
import { compactProgress, seriesBarForms } from './series-bar-form'

describe('seriesBarForms', () => {
  it('shows the row at every width for up to 10 chapters', () => {
    expect(seriesBarForms(1)).toEqual({ phone: 'row', wide: 'row' })
    expect(seriesBarForms(10)).toEqual({ phone: 'row', wide: 'row' })
  })

  it('shows the compact form on a phone and the row from 640px for 11 to 24 chapters', () => {
    expect(seriesBarForms(11)).toEqual({ phone: 'compact', wide: 'row' })
    expect(seriesBarForms(24)).toEqual({ phone: 'compact', wide: 'row' })
  })

  it('shows the compact form at every width for more than 24 chapters', () => {
    expect(seriesBarForms(25)).toEqual({ phone: 'compact', wide: 'compact' })
  })
})

describe('compactProgress', () => {
  const parts = Array.from({ length: 12 }, (_, n) => n)

  it('names the open chapter and counts the read chapters of the series', () => {
    expect(compactProgress(parts, new Set([0, 1, 2, 3]), 11)).toBe('Chapter 11 · 4 of 12 read')
  })

  it('ignores read chapters that are not in the series', () => {
    expect(compactProgress(parts, new Set([0, 40]), 1)).toBe('Chapter 1 · 1 of 12 read')
  })
})
