import { Link } from 'react-router-dom'
import { getAllPosts, type BlogPost } from '@/lib/blog'
import { getSeries, type Series } from '@/lib/series'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

type Entry =
  | { kind: 'post'; date: string; post: BlogPost }
  | { kind: 'series'; date: string; series: Series; published: number }

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

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

export default function BlogIndex() {
  const entries = buildEntries(getAllPosts())

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Blog</h1>
      {entries.length === 0 ? (
        <p className="text-muted-foreground">No posts yet. Check back soon!</p>
      ) : (
        <div className="flex max-w-4xl flex-col gap-4">
          {entries.map((entry) =>
            entry.kind === 'series' ? (
              <Link key={`series-${entry.series.slug}`} to={`/series/${entry.series.slug}`}>
                <Card className="hover:bg-muted/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-baseline justify-between gap-4">
                      <CardTitle>{entry.series.title}</CardTitle>
                      <span className="text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(entry.date)}
                      </span>
                    </div>
                    <CardDescription>{entry.series.description}</CardDescription>
                    <CardDescription>
                      {entry.published} of {entry.series.chapters.length} chapters published
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ) : (
              <Link key={entry.post.slug} to={`/blog/${entry.post.slug}`}>
                <Card className="hover:bg-muted/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-baseline justify-between gap-4">
                      <CardTitle>
                        {entry.post.title}
                        {entry.post.draft && (
                          <Badge variant="outline" className="ml-2 align-middle">
                            Draft
                          </Badge>
                        )}
                      </CardTitle>
                      <span className="text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(entry.date)}
                      </span>
                    </div>
                    <CardDescription>{entry.post.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ),
          )}
        </div>
      )}
    </div>
  )
}
