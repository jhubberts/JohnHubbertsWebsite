import { Link } from 'react-router-dom'
import { getAllPosts, type BlogPost } from '@/lib/blog'
import { formatPostDate } from '@/lib/format-date'
import { getSeries, type Series } from '@/lib/series'
import { SeriesDigitStrip } from '@/components/blog/handwritten-digit'
import { Badge } from '@/components/ui/badge'
import { SITE_PAGES } from '@/lib/site-pages'
import { useDocumentTitle } from '@/lib/use-document-title'
import { useSeriesProgress } from '@/lib/use-series-progress'

type Entry =
  | { kind: 'post'; date: string; post: BlogPost }
  | { kind: 'series'; date: string; series: Series; published: number }

function buildEntries(posts: BlogPost[]): Entry[] {
  const entries: Entry[] = []
  const seriesEntries = new Map<string, Extract<Entry, { kind: 'series' }>>()

  // posts are sorted newest first, so the first post seen for a series is its newest
  for (const post of posts) {
    const series = post.series ? getSeries(post.series) : undefined
    if (!series) {
      entries.push({ kind: 'post', date: post.date, post })
      continue
    }
    const existing = seriesEntries.get(series.slug)
    if (existing) {
      existing.published += 1
    } else {
      const entry = { kind: 'series' as const, date: post.date, series, published: 1 }
      seriesEntries.set(series.slug, entry)
      entries.push(entry)
    }
  }
  return entries
}

const dateClasses =
  'text-muted-foreground text-xs font-medium tracking-[0.04em] uppercase tabular-nums'

function SeriesEntry({
  series,
  date,
  published,
}: {
  series: Series
  date: string
  published: number
}) {
  const { read } = useSeriesProgress(series.slug)
  return (
    <li>
      <Link viewTransition to={`/series/${series.slug}`} className="group block py-5">
        <p className={dateClasses}>{formatPostDate(date, 'short')}</p>
        <h2 className="mt-1 font-serif text-[1.375rem] leading-tight font-semibold group-hover:underline group-focus-visible:underline">
          {series.title}
        </h2>
        <p className="text-muted-foreground mt-1.5">{series.description}</p>
        <p className="text-muted-foreground mt-1.5 text-sm">
          {published} of {series.chapters.length} chapters published
        </p>
        <SeriesDigitStrip
          parts={series.chapters.map((chapter) => chapter.part)}
          read={read}
          wrap
          className="mt-3 gap-1"
          digitClassName="size-6"
        />
      </Link>
    </li>
  )
}

export default function BlogIndex() {
  useDocumentTitle(SITE_PAGES.blog.title)
  const entries = buildEntries(getAllPosts())

  return (
    <div className="page-container pt-8 pb-16 md:pt-12">
      <div className="mx-auto max-w-[40rem]">
        <h1 className="page-title">Blog</h1>
        {entries.length === 0 ? (
          <p className="text-muted-foreground mt-8">No posts yet. Check back soon!</p>
        ) : (
          <ul className="mt-8 divide-y border-y">
            {entries.map((entry) =>
              entry.kind === 'series' ? (
                <SeriesEntry
                  key={`series-${entry.series.slug}`}
                  series={entry.series}
                  date={entry.date}
                  published={entry.published}
                />
              ) : (
                <li key={entry.post.slug}>
                  <Link viewTransition to={`/blog/${entry.post.slug}`} className="group block py-5">
                    <p className={dateClasses}>{formatPostDate(entry.date, 'short')}</p>
                    <h2 className="mt-1 font-serif text-[1.375rem] leading-tight font-semibold group-hover:underline group-focus-visible:underline">
                      {entry.post.title}
                      {entry.post.draft && (
                        <Badge variant="outline" className="ml-2 align-middle font-sans">
                          Draft
                        </Badge>
                      )}
                    </h2>
                    <p className="text-muted-foreground mt-1.5">{entry.post.description}</p>
                  </Link>
                </li>
              ),
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
