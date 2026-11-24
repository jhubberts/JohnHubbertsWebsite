import { describe, expect, it } from 'vitest'
import { formatPostDate } from './format-date'

describe('formatPostDate', () => {
  it('writes the month out in full or abbreviated', () => {
    expect(formatPostDate('2026-11-23', 'long')).toBe('November 23, 2026')
    expect(formatPostDate('2026-11-23', 'short')).toBe('Nov 23, 2026')
  })

  it('keeps the calendar day of the frontmatter date whatever the time zone', () => {
    expect(formatPostDate('2026-01-01', 'long')).toBe('January 1, 2026')
  })

  it('matches toLocaleDateString for text that is not a date', () => {
    expect(formatPostDate('', 'short')).toBe(new Date('').toLocaleDateString('en-US'))
  })
})
