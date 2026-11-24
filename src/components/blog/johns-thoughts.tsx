import { useId, type ReactNode } from 'react'
import { UserRound } from 'lucide-react'

const LABEL = 'John the Human’s Thoughts'

/**
 * John's own opinion, set between a chapter's paragraphs: a tinted panel with a green edge, a
 * small person mark and a label, and the opinion in slightly larger text than the chapter's.
 * Markdown inside it (paragraphs, links, emphasis) renders as it does in the chapter.
 */
export function JohnsThoughts({ children }: { children: ReactNode }) {
  const labelId = useId()
  return (
    <div
      role="note"
      aria-labelledby={labelId}
      className="border-primary bg-accent/60 my-8 rounded-r-xl border-l-4 px-5 py-4"
    >
      <p className="not-prose flex items-center gap-2">
        <span
          aria-hidden="true"
          className="bg-primary text-primary-foreground inline-flex size-6 shrink-0 items-center justify-center rounded-[22%]"
        >
          <UserRound className="size-4" />
        </span>
        <span id={labelId} className="text-primary text-sm font-semibold">
          {LABEL}
        </span>
      </p>
      <div className="mt-2 text-[1.1875rem] leading-relaxed md:text-[1.25rem] [&>:first-child]:mt-0 [&>:last-child]:mb-0">
        {children}
      </div>
    </div>
  )
}
