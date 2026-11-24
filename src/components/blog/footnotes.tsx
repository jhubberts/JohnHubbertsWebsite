import type { ComponentProps, MouseEvent } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

/** How long a source stays highlighted after its number is tapped. */
const HIGHLIGHT_MS = 2000

function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

/**
 * Scrolls to the element with the id in `href` (`#id`) and moves focus to it, opening the folded
 * section it is in. Returns false when there is no such element.
 */
function goTo(href: string | undefined, highlight: boolean): boolean {
  const target = href?.startsWith('#') ? document.getElementById(href.slice(1)) : null
  if (!target) return false
  const details = target.closest('details')
  if (details && !details.open) details.open = true
  target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' })
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
  target.focus({ preventScroll: true })
  if (highlight) {
    target.setAttribute('data-highlighted', '')
    window.setTimeout(() => target.removeAttribute('data-highlighted'), HIGHLIGHT_MS)
  }
  return true
}

function follow(event: MouseEvent<HTMLAnchorElement>, highlight: boolean) {
  if (goTo(event.currentTarget.getAttribute('href') ?? undefined, highlight)) {
    event.preventDefault()
  }
}

type AnchorProps = ComponentProps<'a'> & {
  'data-footnote-ref'?: unknown
  'data-footnote-backref'?: unknown
}

/**
 * Every link in a post. A footnote's number opens the sources and shows its source; a source's
 * back arrow returns to the number. Other links are plain links.
 */
export function PostLink(props: AnchorProps) {
  if (props['data-footnote-ref'] !== undefined) {
    return (
      <a
        {...props}
        onClick={(event) => follow(event, true)}
        className={cn(
          props.className,
          // The number is small; the space around it also takes the tap, 24px or more each way.
          "text-primary focus-visible:ring-ring relative rounded-sm px-0.5 font-semibold no-underline before:absolute before:-inset-x-2.5 before:-inset-y-1.5 before:content-[''] focus-visible:ring-2 focus-visible:outline-none",
        )}
      />
    )
  }
  if (props['data-footnote-backref'] !== undefined) {
    return (
      <a
        {...props}
        onClick={(event) => follow(event, false)}
        className={cn(
          props.className,
          'text-primary inline-flex min-h-11 min-w-11 items-center justify-center no-underline',
        )}
      />
    )
  }
  return <a {...props} />
}

type DetailsProps = ComponentProps<'details'> & {
  'data-footnotes'?: unknown
  'data-count'?: string
}

/**
 * Every folded section in a post. The one made from a post's footnotes (see
 * rehype-footnote-sources.ts) becomes "Sources (n)", closed until opened or until one of its
 * numbers is tapped.
 */
export function PostDetails({ 'data-count': count, className, children, ...props }: DetailsProps) {
  if (props['data-footnotes'] === undefined) {
    return (
      <details {...props} data-count={count} className={className}>
        {children}
      </details>
    )
  }
  return (
    <details {...props} className={cn(className, 'group bg-card mt-12 rounded-xl border px-4')}>
      {/* Each footnote number is described by this summary (aria-describedby="footnote-label"). */}
      <summary
        id="footnote-label"
        className="not-prose focus-visible:ring-ring flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-xl font-semibold focus-visible:ring-2 focus-visible:outline-none [&::-webkit-details-marker]:hidden"
      >
        Sources ({count})
        <ChevronDown aria-hidden="true" className="size-5 shrink-0 group-open:rotate-180" />
      </summary>
      {children}
    </details>
  )
}
