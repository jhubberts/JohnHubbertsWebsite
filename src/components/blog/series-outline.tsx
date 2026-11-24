import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  ChapterDigit,
  HandwrittenNumber,
  SeriesDigitStrip,
} from '@/components/blog/handwritten-digit'
import type { BlogPost } from '@/lib/blog'
import type { PlannedChapter } from '@/lib/series'
import type { NumberedHalf, NumberedSection } from '@/lib/series-sections'
import { cn } from '@/lib/utils'

/** The id of a section's heading on the series page, for links that jump to it. */
function sectionAnchor(section: NumberedSection): string {
  return `part-${section.number}`
}

/**
 * The series at a glance: its halves side by side on a wide screen, each listing its sections
 * ("Part 1" and so on) with their chapters as handwritten numbers that show which are read. A
 * section links to its place in the chapter list below.
 */
export function SeriesMap({ halves, read }: { halves: NumberedHalf[]; read: ReadonlySet<number> }) {
  return (
    <nav aria-label="Parts of the series" className="mt-6 grid gap-3 sm:grid-cols-2">
      {halves.map((half, index) => (
        // The second half is tinted so the two halves read as two different kinds of chapter.
        <div
          key={half.title}
          className={cn('rounded-xl border p-3', index === 0 ? 'bg-card' : 'bg-accent/60')}
        >
          <p className="eyebrow text-primary px-2">{half.title}</p>
          <ol className="mt-1 flex flex-col">
            {half.sections.map((section) => (
              <li key={section.number}>
                <a
                  href={`#${sectionAnchor(section)}`}
                  className="hover:bg-muted/60 focus-visible:ring-ring flex min-h-11 flex-col gap-1 rounded-lg px-2 py-2 focus-visible:ring-2 focus-visible:outline-none"
                >
                  <span className="text-[0.9375rem] leading-snug font-medium">
                    <span className="text-muted-foreground">Part {section.number} · </span>
                    {section.title}
                  </span>
                  <SeriesDigitStrip
                    parts={section.chapters}
                    read={read}
                    wrap
                    className="gap-0.5"
                    digitClassName="size-6"
                  />
                </a>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </nav>
  )
}

/**
 * One chapter's row in the list: its number, title and summary, and whether it is read. A chapter
 * with no post yet has a dashed border and no link.
 */
export function ChapterRow({
  chapter,
  post,
  isRead,
}: {
  chapter: PlannedChapter
  post: BlogPost | undefined
  isRead: boolean
}) {
  const rowClasses = 'flex min-h-16 items-center gap-4 rounded-xl border p-3'
  const body = (
    <>
      <ChapterDigit part={chapter.part} state={isRead ? 'read' : 'unread'} className="size-10" />
      <span className="min-w-0 flex-1">
        <span className="block font-medium">
          <span className="sr-only">Chapter {chapter.part}: </span>
          {chapter.title}
        </span>
        <span className="text-muted-foreground block text-sm">
          {post ? post.description : 'coming'}
        </span>
      </span>
      {isRead && <span className="text-muted-foreground shrink-0 text-xs font-medium">✓ Read</span>}
    </>
  )
  return (
    <li>
      {post ? (
        <Link
          viewTransition
          to={`/blog/${post.slug}`}
          className={cn(rowClasses, 'hover:bg-muted/50 transition-colors')}
        >
          {body}
        </Link>
      ) : (
        <div className={cn(rowClasses, 'border-dashed')}>{body}</div>
      )}
    </li>
  )
}

/** The heading over one half, with a line after the title that runs to the edge of the column. */
function HalfHeading({ half }: { half: NumberedHalf }) {
  return (
    <div className="mt-14">
      <h2 className="flex items-center gap-4 font-serif text-[1.75rem] leading-tight font-semibold sm:text-[2rem]">
        {half.title}
        <span aria-hidden="true" className="bg-primary/30 h-0.5 flex-1 rounded-full" />
      </h2>
      <p className="text-muted-foreground mt-1">{half.description}</p>
    </div>
  )
}

/**
 * The heading over one section: its number in handwriting, its title, what it covers, and how many
 * of its chapters are read.
 */
function SectionHeading({
  section,
  read,
}: {
  section: NumberedSection
  read: ReadonlySet<number>
}) {
  const readCount = section.chapters.filter((part) => read.has(part)).length
  return (
    <div id={sectionAnchor(section)} className="mt-8 flex scroll-mt-20 items-start gap-3">
      <HandwrittenNumber
        value={section.number}
        className="text-primary h-14 w-11 shrink-0 sm:h-16 sm:w-12"
      />
      <div className="min-w-0 pt-1">
        <p className="eyebrow">
          Part {section.number} · {readCount} of {section.chapters.length} read
        </p>
        <h3 className="mt-1 font-serif text-[1.375rem] leading-tight font-semibold">
          {section.title}
        </h3>
        <p className="text-muted-foreground mt-1 text-[0.9375rem]">{section.description}</p>
      </div>
    </div>
  )
}

/**
 * The chapter list under its half and section headings. `renderChapters` draws the rows for a
 * list of chapter numbers.
 */
export function SeriesSections({
  halves,
  read,
  renderChapters,
}: {
  halves: NumberedHalf[]
  read: ReadonlySet<number>
  renderChapters: (parts: number[]) => ReactNode
}) {
  return halves.map((half) => (
    <section key={half.title} aria-label={half.title}>
      <HalfHeading half={half} />
      {half.sections.map((section) => (
        <section key={section.number} aria-label={`Part ${section.number}: ${section.title}`}>
          <SectionHeading section={section} read={read} />
          {/* The left margin is half the width of the section's number, so the border runs down
              from under its middle. */}
          <ol className="border-primary/25 mt-3 ml-[1.375rem] flex flex-col gap-2 border-l-2 pl-3 sm:ml-6">
            {renderChapters(section.chapters)}
          </ol>
        </section>
      ))}
    </section>
  ))
}
