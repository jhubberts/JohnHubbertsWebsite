import { Suspense } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPostBySlug } from '@/lib/blog'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SeriesNav } from '@/components/blog/series-nav'
import { ArrowLeft } from 'lucide-react'
import { useDocumentTitle } from '@/lib/use-document-title'
import NotFound from './not-found'

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? getPostBySlug(slug) : undefined

  useDocumentTitle(post?.title)

  if (!post) return <NotFound />

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link
        to="/blog"
        className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'mb-6' })}
      >
        <ArrowLeft className="mr-1 h-3 w-3" /> Back to Blog
      </Link>
      {post.series && <SeriesNav seriesSlug={post.series} part={post.part} />}
      <article className="prose prose-neutral dark:prose-invert max-w-none">
        <div className="not-prose mb-8">
          {post.draft && (
            <Badge variant="outline" className="mr-2">
              Draft
            </Badge>
          )}
          <time className="text-muted-foreground text-sm">
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              timeZone: 'UTC',
            })}
          </time>
        </div>
        <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
          <post.Component />
        </Suspense>
      </article>
      {post.series && <SeriesNav seriesSlug={post.series} part={post.part} />}
    </div>
  )
}
