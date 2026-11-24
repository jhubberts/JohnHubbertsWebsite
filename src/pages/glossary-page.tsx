import { Link } from 'react-router-dom'
import { getPostSource, getSeriesPosts, getSeriesPostsByPart } from '@/lib/blog'
import {
  GLOSSARY,
  GLOSSARY_SERIES,
  alphabetical,
  chaptersUsing,
  type GlossaryEntry,
} from '@/lib/ai-series/glossary'
import { getSeries, seriesShortName } from '@/lib/series'
import { useDocumentTitle } from '@/lib/use-document-title'

const linkClass =
  'text-primary inline-flex min-h-11 items-center underline underline-offset-2 focus-visible:ring-ring rounded-sm focus-visible:ring-2 focus-visible:outline-none'

/** A link to a chapter's page, or the words alone when the chapter has no page yet. */
function ChapterLink({
  part,
  slugs,
  children,
}: {
  part: number
  slugs: Map<number, string>
  children: string
}) {
  const slug = slugs.get(part)
  if (!slug) return <span className="inline-flex min-h-11 items-center">{children}</span>
  return (
    <Link to={`/blog/${slug}`} className={linkClass}>
      {children}
    </Link>
  )
}

function Entry({
  entry,
  usedIn,
  slugs,
}: {
  entry: GlossaryEntry
  usedIn: number[]
  slugs: Map<number, string>
}) {
  return (
    <li id={entry.id} className="scroll-mt-20 rounded-xl border p-4">
      <h2 className="font-serif text-[1.375rem] leading-tight font-semibold">{entry.term}</h2>
      {entry.aka && entry.aka.length > 0 && (
        <p className="text-muted-foreground mt-1 text-sm">({entry.aka.join(', ')})</p>
      )}
      <p className="mt-2">{entry.summary}</p>
      {entry.more && <p className="mt-2">{entry.more}</p>}
      <p className="mt-1">
        <ChapterLink part={entry.chapter} slugs={slugs}>
          {`Explained in chapter ${entry.chapter}`}
        </ChapterLink>
      </p>
      {usedIn.length > 0 && (
        <p className="flex flex-wrap items-center gap-x-3">
          <span>Used in chapters</span>
          {usedIn.map((part) => (
            <ChapterLink key={part} part={part} slugs={slugs}>
              {String(part)}
            </ChapterLink>
          ))}
        </p>
      )}
    </li>
  )
}

/** Every word the AI series explains, in alphabetical order, with where it is explained and used. */
export default function GlossaryPage() {
  useDocumentTitle('Glossary')
  const series = getSeries(GLOSSARY_SERIES)
  const slugs = new Map(
    [...getSeriesPostsByPart(GLOSSARY_SERIES)].map(([part, post]) => [part, post.slug]),
  )
  const uses = chaptersUsing(
    getSeriesPosts(GLOSSARY_SERIES).flatMap((post) => {
      const source = getPostSource(post.slug)
      return post.part !== undefined && source ? [{ part: post.part, source }] : []
    }),
  )

  return (
    <div className="page-container pt-8 pb-16 md:pt-12">
      <div className="mx-auto max-w-[40rem]">
        {series && (
          <Link
            to={`/series/${series.slug}`}
            className="eyebrow inline-flex min-h-11 items-center underline-offset-4 hover:underline"
          >
            {seriesShortName(series)}
          </Link>
        )}
        <h1 className="page-title mt-1">Glossary</h1>
        <ul className="mt-8 flex flex-col gap-3">
          {alphabetical(GLOSSARY).map((entry) => (
            <Entry key={entry.id} entry={entry} usedIn={uses.get(entry.id) ?? []} slugs={slugs} />
          ))}
        </ul>
      </div>
    </div>
  )
}
