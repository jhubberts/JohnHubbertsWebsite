import { Link } from 'react-router-dom'
import { getSeries, type PlannedChapter } from '@/lib/series'
import { getSeriesPosts } from '@/lib/blog'

const linkClass =
  'hover:bg-muted inline-flex min-h-11 items-center rounded-lg px-2 text-sm font-medium'

function Neighbour({
  label,
  chapter,
  slugByPart,
  align,
}: {
  label: string
  chapter: PlannedChapter | undefined
  slugByPart: Map<number, string>
  align: 'left' | 'right'
}) {
  const alignClass = align === 'right' ? 'items-end text-right' : 'items-start text-left'
  if (!chapter) return <div className="flex-1" />
  const slug = slugByPart.get(chapter.part)
  return (
    <div className={`flex min-w-0 flex-1 flex-col ${alignClass}`}>
      <span className="text-muted-foreground text-xs">{label}</span>
      {slug ? (
        <Link to={`/blog/${slug}`} className={linkClass}>
          {chapter.title}
        </Link>
      ) : (
        <span className="text-muted-foreground flex min-h-11 items-center px-2 text-sm">
          {chapter.title} (coming)
        </span>
      )}
    </div>
  )
}

export function SeriesNav({ seriesSlug, part }: { seriesSlug: string; part?: number }) {
  const series = getSeries(seriesSlug)
  if (!series) return null

  const slugByPart = new Map<number, string>()
  for (const post of getSeriesPosts(seriesSlug)) {
    if (post.part !== undefined && !slugByPart.has(post.part)) slugByPart.set(post.part, post.slug)
  }

  const current = part ?? 0
  const previous = [...series.chapters].reverse().find((c) => c.part < current)
  const next = series.chapters.find((c) => c.part > current)

  return (
    <nav aria-label="Series navigation" className="not-prose my-6 rounded-lg border p-4">
      <div className="flex flex-wrap items-center justify-between gap-x-4">
        <Link to={`/series/${series.slug}`} className={`${linkClass} min-w-0 font-semibold`}>
          {series.title}
        </Link>
        {part !== undefined && (
          <span className="text-muted-foreground text-sm whitespace-nowrap">Chapter {part}</span>
        )}
      </div>
      <div className="mt-2 flex gap-4">
        <Neighbour label="Previous" chapter={previous} slugByPart={slugByPart} align="left" />
        <Neighbour label="Next" chapter={next} slugByPart={slugByPart} align="right" />
      </div>
    </nav>
  )
}
