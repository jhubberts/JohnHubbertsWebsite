import { afterAll, describe, expect, it, vi } from 'vitest'
import { formatPostDate } from './format-date'

// Runs before the import above. A frontmatter date is midnight UTC, which is still the day before
// in Los Angeles, so a formatter that used the machine's time zone would show the wrong day here
// whatever time zone the tests run in.
const originalTimeZone = vi.hoisted(() => {
  const original = process.env.TZ
  process.env.TZ = 'America/Los_Angeles'
  return original
})

afterAll(() => {
  if (originalTimeZone === undefined) delete process.env.TZ
  else process.env.TZ = originalTimeZone
})

describe('formatPostDate', () => {
  it('writes the month out in full or abbreviated', () => {
    expect(formatPostDate('2026-11-23', 'long')).toBe('November 23, 2026')
    expect(formatPostDate('2026-11-23', 'short')).toBe('Nov 23, 2026')
  })

  it('keeps the calendar day of the frontmatter date for a reader west of Greenwich', () => {
    expect(formatPostDate('2026-01-01', 'long')).toBe('January 1, 2026')
  })

  it('writes "Invalid Date" for text that is not a date', () => {
    expect(formatPostDate('', 'short')).toBe('Invalid Date')
  })
})
