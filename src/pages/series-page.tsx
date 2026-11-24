import { Link, useParams } from 'react-router-dom'
import { ChapterDigit, SeriesDigitStrip } from '@/components/blog/handwritten-digit'
import { buttonVariants } from '@/components/ui/button'
import { getSeriesPosts } from '@/lib/blog'
import { firstUnread } from '@/lib/series-progress'
import { getSeries, type Series } from '@/lib/series'
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
  const lowest = Math.min(...available)
  if (!available.some((part) => read.has(part))) {
    return { part: lowest, label: `Start with chapter ${lowest}` }
  }
  const next = firstUnread(available, read)
  if (next === undefined) return { part: lowest, label: `Start again with chapter ${lowest}` }
  return { part: next, label: `Continue with chapter ${next}` }
}

function SeriesContent({ series }: { series: Series }) {
  const { read } = useSeriesProgress(series.slug)
  const posts = getSeriesPosts(series.slug)
  const parts = series.chapters.map((chapter) => chapter.part)
  const start = chooseStart(
    posts.flatMap((post) => (post.part === undefined ? [] : [post.part])),
    read,
  )
  const startPost = start && posts.find((post) => post.part === start.part)

  return (
    <div className="mx-auto max-w-4xl px-4 pt-8 pb-16 md:pt-12">
      <div className="mx-auto max-w-[40rem]">
        <p className="text-muted-foreground text-xs font-semibold tracking-[0.08em] uppercase">
          Series · {series.chapters.length} chapters
        </p>
        <h1 className="page-title mt-2">{series.title}</h1>
        <p className="text-muted-foreground mt-3 text-lg">{series.description}</p>
        <SeriesDigitStrip
          parts={parts}
          read={read}
          wrap
          className="mt-6 gap-1"
          digitClassName="size-7 sm:size-9"
        />
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
        <ol className="mt-8 flex flex-col gap-2">
          {series.chapters.map((chapter) => {
            const post = posts.find((p) => p.part === chapter.part)
            const isRead = read.has(chapter.part)
            const rowClasses = 'flex min-h-16 items-center gap-4 rounded-xl border p-3'
            const body = (
              <>
                <ChapterDigit
                  part={chapter.part}
                  state={isRead ? 'read' : 'unread'}
                  className="size-10"
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">
                    <span className="sr-only">Chapter {chapter.part}: </span>
                    {chapter.title}
                  </span>
                  <span className="text-muted-foreground block text-sm">
                    {post ? post.description : 'coming'}
                  </span>
                </span>
                {isRead && (
                  <span className="text-muted-foreground shrink-0 text-xs font-medium">✓ Read</span>
                )}
              </>
            )
            return (
              <li key={chapter.part}>
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
          })}
        </ol>
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
