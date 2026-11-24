import { Suspense } from 'react'
import { useParams } from 'react-router-dom'
import { getPostBySlug } from '@/lib/blog'
import { Badge } from '@/components/ui/badge'
import { ChapterDigit } from '@/components/blog/handwritten-digit'
import { ChapterEnd } from '@/components/blog/chapter-end'
import { SeriesBar } from '@/components/blog/series-bar'
import { useDocumentTitle } from '@/lib/use-document-title'
import { PagePlaceholder } from '@/components/layout/page-placeholder'
import NotFound from './not-found'

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? getPostBySlug(slug) : undefined

  useDocumentTitle(post?.title)

  if (!post) return <NotFound />

  // The series and chapter number when the post is a chapter of a series.
  const chapter =
    post.series && post.part !== undefined ? { series: post.series, part: post.part } : undefined

  return (
    <>
      {chapter && <SeriesBar seriesSlug={chapter.series} part={chapter.part} />}
      <div className="page-container pt-6 pb-16 md:pt-10">
        <article className="prose prose-neutral dark:prose-invert article-prose">
          {(chapter || post.draft) && (
            <div className="not-prose mb-3 flex items-center gap-2">
              {chapter && (
                <>
                  <ChapterDigit part={chapter.part} state="current" className="size-7" />
                  <span className="eyebrow">Chapter {chapter.part}</span>
                </>
              )}
              {post.draft && <Badge variant="outline">Draft</Badge>}
            </div>
          )}
          {/* Keyed by post so moving to another post starts its loading and reading state afresh.
              The end of the post sits inside the boundary, so it cannot record the chapter as read
              before the chapter is on the page. */}
          <Suspense key={post.slug} fallback={<PagePlaceholder />}>
            <post.Component />
            <ChapterEnd post={post} />
          </Suspense>
        </article>
      </div>
    </>
  )
}
