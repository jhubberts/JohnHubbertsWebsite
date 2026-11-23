import { Link, useParams } from 'react-router-dom'
import { getSeriesPosts } from '@/lib/blog'
import { getSeries } from '@/lib/series'
import { useDocumentTitle } from '@/lib/use-document-title'
import NotFound from './not-found'

export default function SeriesPage() {
  const { slug } = useParams<{ slug: string }>()
  const series = slug ? getSeries(slug) : undefined

  useDocumentTitle(series?.title)

  if (!series) return <NotFound />

  const posts = getSeriesPosts(series.slug)

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold">{series.title}</h1>
      <p className="text-muted-foreground mb-8">{series.description}</p>
      <ol className="flex flex-col gap-2">
        {series.chapters.map((chapter) => {
          const post = posts.find((p) => p.part === chapter.part)
          const body = (
            <>
              <span className="text-muted-foreground w-6 shrink-0 text-right">{chapter.part}</span>
              <span className="min-w-0">
                <span className="block font-medium">{chapter.title}</span>
                {post ? (
                  <span className="text-muted-foreground block text-sm">{post.description}</span>
                ) : (
                  <span className="text-muted-foreground block text-sm">coming</span>
                )}
              </span>
            </>
          )
          return (
            <li key={chapter.part}>
              {post ? (
                <Link
                  to={`/blog/${post.slug}`}
                  className="hover:bg-muted/50 flex min-h-11 items-start gap-3 rounded-lg border p-3 transition-colors"
                >
                  {body}
                </Link>
              ) : (
                <div className="flex min-h-11 items-start gap-3 rounded-lg border border-dashed p-3">
                  {body}
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
