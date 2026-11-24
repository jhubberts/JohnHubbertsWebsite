import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { ChapterDigit, SeriesDigitStrip, chapterState } from '@/components/blog/handwritten-digit'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { getSeriesPostsByPart } from '@/lib/blog'
import { getSeries, seriesShortName } from '@/lib/series'
import { sectionStartingAt } from '@/lib/series-sections'
import {
  MOST_CHAPTERS_IN_ROW_ON_PHONE,
  MOST_CHAPTERS_IN_ROW_WIDE,
  compactProgress,
} from '@/lib/series-bar-form'
import { describeProgress } from '@/lib/series-progress'
import { useSeriesProgress } from '@/lib/use-series-progress'
import { cn } from '@/lib/utils'

/**
 * A strip under the site's top bar naming the series and showing which chapters are read. It stays
 * at the top of the screen while the chapter scrolls, and opens the list of chapters when pressed.
 */
export function SeriesBar({ seriesSlug, part }: { seriesSlug: string; part: number }) {
  const series = getSeries(seriesSlug)
  const { read } = useSeriesProgress(seriesSlug)
  const [open, setOpen] = useState(false)
  if (!series) return null

  const name = seriesShortName(series)
  const parts = series.chapters.map((chapter) => chapter.part)
  const postsByPart = getSeriesPostsByPart(seriesSlug)
  // A long series shows its progress in a compact form where the row of numbers has no room:
  // below 640px when the row does not fit on a phone, at every width when it does not fit at all.
  const rowOnPhone = parts.length <= MOST_CHAPTERS_IN_ROW_ON_PHONE
  const rowWide = parts.length <= MOST_CHAPTERS_IN_ROW_WIDE

  return (
    <div
      data-series-bar
      className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full border-b backdrop-blur"
    >
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          aria-label={`${name}. ${describeProgress(parts, read, part)} Open the chapter list.`}
          className="hover:bg-muted/60 focus-visible:ring-ring page-container flex h-11 w-full items-center gap-3 text-left focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
        >
          <span className="min-w-0 flex-1 truncate text-[0.8125rem] font-semibold">{name}</span>
          {/* The button's label already describes the progress, so it is not read again here. */}
          <span aria-hidden="true" className="flex shrink-0 items-center gap-1">
            {!rowOnPhone && (
              <span className={cn('flex items-center gap-1.5', rowWide && 'sm:hidden')}>
                <ChapterDigit part={part} state="current" className="size-5" />
                <span className="text-muted-foreground text-[0.8125rem] whitespace-nowrap">
                  {compactProgress(parts, read, part)}
                </span>
              </span>
            )}
            {rowWide && (
              <span className={cn('flex items-center', !rowOnPhone && 'hidden sm:flex')}>
                <SeriesDigitStrip
                  parts={parts}
                  read={read}
                  current={part}
                  className="gap-0.5"
                  digitClassName="size-5 sm:size-[22px]"
                />
              </span>
            )}
            <ChevronDown aria-hidden="true" className="text-muted-foreground size-4" />
          </span>
        </SheetTrigger>
        <SheetContent
          side="bottom"
          className="max-h-[80dvh] gap-0 sm:mx-auto sm:max-w-xl sm:rounded-t-xl sm:border-x"
        >
          <div className="p-4 pr-14">
            <SheetTitle className="font-serif text-lg font-semibold">{series.title}</SheetTitle>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
            <ol>
              {series.chapters.map((chapter) => {
                const post = postsByPart.get(chapter.part)
                const state = chapterState(chapter.part, read, part)
                const isCurrent = state === 'current'
                const digit = <ChapterDigit part={chapter.part} state={state} className="size-9" />
                // A section's heading is shown above its first chapter.
                const section = sectionStartingAt(series, chapter.part)
                return (
                  <li key={chapter.part}>
                    {section && (
                      <p className="eyebrow mt-4 mb-1 px-2">
                        Part {section.number} · {section.title}
                      </p>
                    )}
                    {post ? (
                      <Link
                        viewTransition
                        to={`/blog/${post.slug}`}
                        onClick={() => setOpen(false)}
                        aria-current={isCurrent ? 'page' : undefined}
                        className="hover:bg-muted focus-visible:ring-ring flex min-h-12 items-center gap-3 rounded-lg px-2 py-1.5 text-[0.9375rem] focus-visible:ring-2 focus-visible:outline-none aria-[current=page]:font-semibold"
                      >
                        {digit}
                        <span className="min-w-0 flex-1">{chapter.title}</span>
                        {isCurrent ? (
                          <span className="text-muted-foreground shrink-0 text-xs">
                            You are here
                          </span>
                        ) : (
                          state === 'read' && (
                            <span className="text-muted-foreground shrink-0 text-xs">✓ Read</span>
                          )
                        )}
                      </Link>
                    ) : (
                      <div className="text-muted-foreground flex min-h-12 items-center gap-3 px-2 py-1.5 text-[0.9375rem]">
                        {digit}
                        <span className="min-w-0 flex-1">{chapter.title} (coming)</span>
                      </div>
                    )}
                  </li>
                )
              })}
            </ol>
            <Link
              viewTransition
              to={`/series/${series.slug}`}
              onClick={() => setOpen(false)}
              className="text-primary mt-2 inline-flex min-h-11 items-center px-2 text-[0.9375rem] font-medium underline-offset-4 hover:underline"
            >
              All {series.chapters.length} chapters
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
