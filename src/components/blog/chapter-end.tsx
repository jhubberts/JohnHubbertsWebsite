import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { ChapterDigit } from '@/components/blog/handwritten-digit'
import { GLOSSARY_PATH, GLOSSARY_SERIES } from '@/lib/ai-series/glossary'
import { getSeriesPostsByPart, type BlogPost } from '@/lib/blog'
import { formatPostDate } from '@/lib/format-date'
import { getSeries, type PlannedChapter, type Series } from '@/lib/series'
import { seriesNeighbours } from '@/lib/series-neighbours'
import { sectionStartingAt, type NumberedSection } from '@/lib/series-sections'
import { useSeriesProgress } from '@/lib/use-series-progress'
import { cn } from '@/lib/utils'

const rowLinkClass =
  'inline-flex min-h-11 items-center text-[0.9375rem] font-medium underline-offset-4 hover:underline'

/** The post's date written out, such as "November 23, 2026". Nothing when the post has no date. */
function PostDate({ date, className }: { date: string; className?: string }) {
  if (!date) return null
  return (
    <p className={cn('text-muted-foreground text-sm', className)}>
      <time dateTime={date}>{formatPostDate(date, 'long')}</time>
    </p>
  )
}

/**
 * Whether the reader has asked their browser to use less data. `navigator.connection` is missing
 * in some browsers, so its absence counts as not asking.
 */
function savesData(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  return connection?.saveData === true
}

/** Calls `onNear` once, when the element comes within `rootMargin` of the screen. */
function useOnceInView<T extends Element>(
  enabled: boolean,
  rootMargin: string,
  onNear: () => void,
) {
  const ref = useRef<T>(null)
  const onNearRef = useRef(onNear)
  useEffect(() => {
    onNearRef.current = onNear
  })
  useEffect(() => {
    const element = ref.current
    if (!enabled || !element || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect()
          onNearRef.current()
        }
      },
      { rootMargin },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [enabled, rootMargin])
  return ref
}

function NextCard({
  chapter,
  post,
  isRead,
  newPart,
}: {
  chapter: PlannedChapter
  post: BlogPost | undefined
  isRead: boolean
  /** The part the next chapter starts, when it is the first chapter of a part. */
  newPart?: NumberedSection
}) {
  // Start downloading the next chapter shortly before the reader reaches this card, so opening it
  // does not wait on the network. A reader who asked to save data downloads it only on opening it.
  const linkRef = useOnceInView<HTMLAnchorElement>(
    post !== undefined && !savesData(),
    '600px 0px',
    () => post?.preload(),
  )
  const digit = (
    <ChapterDigit part={chapter.part} state={isRead ? 'read' : 'unread'} className="size-12" />
  )
  const label = (
    <>
      <span className="eyebrow">Next · Chapter {chapter.part}</span>
      {newPart && (
        <span className="text-primary text-sm font-medium">
          Part {newPart.number} begins: {newPart.title}
        </span>
      )}
    </>
  )

  if (!post) {
    return (
      <div className="bg-card mt-4 flex min-h-[88px] items-center gap-4 rounded-xl border border-dashed p-4">
        {digit}
        <div className="flex min-w-0 flex-col gap-1">
          {label}
          <span className="font-serif text-[1.375rem] leading-tight font-semibold">
            {chapter.title} (coming)
          </span>
        </div>
      </div>
    )
  }

  return (
    <Link
      viewTransition
      ref={linkRef}
      to={`/blog/${post.slug}`}
      className="group bg-card hover:border-primary focus-visible:border-primary focus-visible:ring-ring mt-4 flex min-h-[88px] items-center gap-4 rounded-xl border p-4 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      {digit}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {label}
        {/* The underline marks hover without relying on the border colour. */}
        <span className="font-serif text-[1.375rem] leading-tight font-semibold underline-offset-4 group-hover:underline">
          {chapter.title}
        </span>
        {post.description && (
          <span className="text-muted-foreground text-[0.9375rem]">{post.description}</span>
        )}
      </div>
      <ArrowRight
        aria-hidden="true"
        className="text-primary size-6 shrink-0 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5 motion-safe:group-focus-visible:translate-x-0.5"
      />
    </Link>
  )
}

function SeriesChapterEnd({
  post,
  series,
  part,
}: {
  post: BlogPost
  series: Series
  part: number
}) {
  const { read, markRead } = useSeriesProgress(series.slug)
  const isRead = read.has(part)
  // The chapter counts as read once the reader scrolls to its end.
  const endRef = useOnceInView<HTMLDivElement>(!isRead, '0px', () => markRead(part))

  const { previous, next } = seriesNeighbours(series.chapters, part)
  const postsByPart = getSeriesPostsByPart(series.slug)
  const previousPost = previous && postsByPart.get(previous.part)

  return (
    <div ref={endRef} className="not-prose mt-12">
      <p role="status" className="text-muted-foreground text-sm">
        {isRead && `✓ Chapter ${part} finished. Remembered on this device.`}
      </p>
      {next && (
        <NextCard
          chapter={next}
          post={postsByPart.get(next.part)}
          isRead={read.has(next.part)}
          newPart={sectionStartingAt(series, next.part)}
        />
      )}
      <div className="mt-6 flex items-start justify-between gap-4">
        {previous && previousPost ? (
          <Link
            viewTransition
            to={`/blog/${previousPost.slug}`}
            className={cn(rowLinkClass, 'min-w-0')}
          >
            <span aria-hidden="true">←&nbsp;</span>
            {previous.title}
          </Link>
        ) : (
          <span />
        )}
        <div className="flex shrink-0 flex-col items-end">
          <Link
            viewTransition
            to={`/series/${series.slug}`}
            className={cn(rowLinkClass, 'whitespace-nowrap')}
          >
            All {series.chapters.length} chapters
          </Link>
          {series.slug === GLOSSARY_SERIES && (
            <Link viewTransition to={GLOSSARY_PATH} className={rowLinkClass}>
              Glossary
            </Link>
          )}
        </div>
      </div>
      <PostDate date={post.date} className="mt-6" />
    </div>
  )
}

function PlainPostEnd({ post }: { post: BlogPost }) {
  return (
    <div className="not-prose mt-12">
      <PostDate date={post.date} />
      <Link viewTransition to="/blog" className={cn(rowLinkClass, 'mt-2')}>
        <span aria-hidden="true">←&nbsp;</span>
        Back to Blog
      </Link>
    </div>
  )
}

/**
 * The end of a post. For a chapter of a series: a note once the chapter is recorded as read, the
 * next chapter (naming the part it starts, when it starts one), and links to the previous chapter,
 * the whole series and, for the AI series, its glossary. For other posts: the date and a link back
 * to the blog.
 */
export function ChapterEnd({ post }: { post: BlogPost }) {
  // A post that names a series the site does not define ends like any other post, and nothing is
  // recorded for it.
  const series = post.series ? getSeries(post.series) : undefined
  if (series && post.part !== undefined) {
    return <SeriesChapterEnd post={post} series={series} part={post.part} />
  }
  return <PlainPostEnd post={post} />
}
