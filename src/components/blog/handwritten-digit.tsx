import { digitPaths, INK_LEVELS, layoutNumber } from '@/lib/handwritten-number'
import { describeProgress } from '@/lib/series-progress'
import { cn } from '@/lib/utils'

/** One digit sample's squares, one path per ink level, each as opaque as its level is dark. */
function DigitInk({ paths }: { paths: string[] }) {
  return paths.map((d, i) => (d ? <path key={i} d={d} fillOpacity={(i + 1) / INK_LEVELS} /> : null))
}

/** A real handwritten digit (0 to 9) drawn in the current text colour, in a square. */
export function HandwrittenDigit({ digit, className }: { digit: number; className?: string }) {
  if (!Number.isInteger(digit) || digit < 0 || digit > 9) return null
  const { minX, paths } = digitPaths(digit, 'first')
  // No digit image has ink above row 3, left of column 4, or past row and column 26, so the view
  // box shows rows and columns 3 to 26 and the digit is drawn larger. The ink goes back to the
  // columns it has in its own image.
  return (
    <svg
      viewBox="3 3 24 24"
      aria-hidden="true"
      shapeRendering="crispEdges"
      fill="currentColor"
      className={className}
    >
      <g transform={`translate(${minX} 0)`}>
        <DigitInk paths={paths} />
      </g>
    </svg>
  )
}

/**
 * A whole number written with real handwritten digits in the current text colour. Every number is
 * 24 units tall and as wide as its digits need, and is centred and scaled to fit the box its
 * class gives it.
 */
export function HandwrittenNumber({ value, className }: { value: number; className?: string }) {
  const layout = layoutNumber(value)
  if (!layout) return null
  return (
    <svg
      viewBox={`0 ${layout.top} ${layout.width} ${layout.height}`}
      aria-hidden="true"
      shapeRendering="crispEdges"
      fill="currentColor"
      className={className}
    >
      {layout.digits.map((placed, i) => (
        <g key={i} transform={`translate(${placed.offsetX} 0)`}>
          <DigitInk paths={digitPaths(placed.digit, placed.sample).paths} />
        </g>
      ))}
    </svg>
  )
}

export type ChapterState = 'read' | 'current' | 'unread'

/** A chapter's state: `current` when it is the open chapter, otherwise read or unread. */
export function chapterState(
  part: number,
  read: ReadonlySet<number>,
  current?: number,
): ChapterState {
  if (part === current) return 'current'
  return read.has(part) ? 'read' : 'unread'
}

const STATE_CLASSES: Record<ChapterState, string> = {
  read: 'bg-primary text-primary-foreground rounded-[22%]',
  current: 'text-foreground ring-primary rounded-[22%] ring-2 ring-inset',
  unread: 'text-muted-foreground',
}

/**
 * A chapter's number in handwritten digits, in a square tile that shows by its form whether the
 * chapter is read. A number of two or more digits is scaled down to fit the same tile.
 */
export function ChapterDigit({
  part,
  state,
  className,
}: {
  part: number
  state: ChapterState
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center',
        STATE_CLASSES[state],
        className,
      )}
    >
      <HandwrittenNumber value={part} className="size-full p-[10%]" />
    </span>
  )
}

/**
 * The chapters of a series as a row of handwritten numbers: which are read, and which one is open.
 * With `wrap`, a row too long for its space continues on further lines, spaced as far apart as the
 * numbers are.
 */
export function SeriesDigitStrip({
  parts,
  read,
  current,
  className,
  digitClassName,
  wrap = false,
}: {
  parts: number[]
  read: ReadonlySet<number>
  current?: number
  className?: string
  /** The size of each number's tile, such as `size-6`. */
  digitClassName: string
  wrap?: boolean
}) {
  return (
    <span
      role="img"
      aria-label={describeProgress(parts, read, current)}
      className={cn('inline-flex items-center', wrap && 'flex-wrap', className)}
    >
      {parts.map((part) => (
        <ChapterDigit
          key={part}
          part={part}
          state={chapterState(part, read, current)}
          className={digitClassName}
        />
      ))}
    </span>
  )
}
