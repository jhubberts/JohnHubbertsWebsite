/**
 * Post dates in the frontmatter are calendar dates such as `2026-11-23`, which JavaScript reads as
 * midnight UTC. They are written out in UTC so a reader west of Greenwich does not see the day
 * before.
 */
const FORMATS = {
  long: new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }),
  short: new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }),
}

/**
 * A post's date written out: `long` gives "November 23, 2026", `short` gives "Nov 23, 2026". Text
 * that is not a date gives "Invalid Date", as `Date.prototype.toLocaleDateString` does.
 */
export function formatPostDate(date: string, style: 'long' | 'short'): string {
  const value = new Date(date)
  return Number.isNaN(value.getTime()) ? 'Invalid Date' : FORMATS[style].format(value)
}
