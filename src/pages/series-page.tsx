import { Link, useParams } from 'react-router-dom'
import { SeriesDigitStrip } from '@/components/blog/handwritten-digit'
import { ChapterRow, SeriesMap, SeriesSections } from '@/components/blog/series-outline'
import { buttonVariants } from '@/components/ui/button'
import { GLOSSARY_PATH, GLOSSARY_SERIES } from '@/lib/ai-series/glossary'
import { getSeriesPostsByPart } from '@/lib/blog'
import { firstUnread } from '@/lib/series-progress'
import { getSeries, type Series } from '@/lib/series'
import { seriesOutline } from '@/lib/series-sections'
import { useDocumentTitle } from '@/lib/use-document-title'
import { useSeriesProgress } from '@/lib/use-series-progress'
import { cn } from '@/lib/utils'
import NotFound from './not-found'

/**
 * Which chapter the button under the title leads to, and what it says. `available` is the chapter
 * numbers that have a visible post. Returns undefined when there are none.
 */
function chooseStart(
  available: number[],
  read: ReadonlySet<number>,
): { part: number; label: string } | undefined {
  if (available.length === 0) return undefined
  const next = firstUnread(available, read)
  if (next === undefined) {
    const lowest = Math.min(...available)
    return { part: lowest, label: `Start again with chapter ${lowest}` }
  }
  const started = available.some((part) => read.has(part))
  return { part: next, label: `${started ? 'Continue' : 'Start'} with chapter ${next}` }
}

function SeriesContent({ series }: { series: Series }) {
  const { read } = useSeriesProgress(series.slug)
  const postsByPart = getSeriesPostsByPart(series.slug)
  const parts = series.chapters.map((chapter) => chapter.part)
  const start = chooseStart([...postsByPart.keys()], read)
  const startPost = start && postsByPart.get(start.part)
  const outline = seriesOutline(series)
  const chapterByPart = new Map(series.chapters.map((chapter) => [chapter.part, chapter]))
  const renderChapters = (chapterParts: number[]) =>
    chapterParts.map((part) => (
      <ChapterRow
        key={part}
        chapter={chapterByPart.get(part)!}
        post={postsByPart.get(part)}
        isRead={read.has(part)}
      />
    ))

  return (
    <div className="page-container pt-8 pb-16 md:pt-12">
      <div className="mx-auto max-w-[40rem]">
        <p className="eyebrow">Series · {series.chapters.length} chapters</p>
        <h1 className="page-title mt-2">{series.title}</h1>
        <p className="text-muted-foreground mt-3 text-lg">{series.description}</p>
        {start && startPost && (
          <div>
            <Link
              viewTransition
              to={`/blog/${startPost.slug}`}
              className={cn(buttonVariants(), 'mt-5 min-h-11 px-5 text-base')}
            >
              {start.label}
            </Link>
          </div>
        )}
        {outline.halves.length > 0 ? (
          <SeriesMap halves={outline.halves} read={read} />
        ) : (
          <SeriesDigitStrip
            parts={parts}
            read={read}
            wrap
            className="mt-6 gap-1"
            digitClassName="size-6 sm:size-9"
          />
        )}
        {outline.outside.length > 0 && (
          <ol className="mt-8 flex flex-col gap-2">{renderChapters(outline.outside)}</ol>
        )}
        <SeriesSections halves={outline.halves} read={read} renderChapters={renderChapters} />
        {series.slug === GLOSSARY_SERIES && (
          <Link
            to={GLOSSARY_PATH}
            className="text-muted-foreground mt-4 inline-flex min-h-11 items-center text-sm font-medium underline-offset-4 hover:underline"
          >
            Glossary
          </Link>
        )}
      </div>
    </div>
  )
}

export default function SeriesPage() {
  const { slug } = useParams<{ slug: string }>()
  const series = slug ? getSeries(slug) : undefined

  useDocumentTitle(series?.title)

  if (!series) return <NotFound />

  return <SeriesContent series={series} />
}
