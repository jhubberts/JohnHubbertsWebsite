import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { getSeriesPostsByPart } from '@/lib/blog'
import { GLOSSARY_SERIES, glossaryAddress, glossaryEntry } from '@/lib/ai-series/glossary'

/** The space kept between the card and each side of the screen, in pixels. */
const SCREEN_MARGIN = 16

const cardLinkClass =
  'text-primary inline-flex min-h-11 items-center underline underline-offset-2 focus-visible:ring-ring rounded-sm focus-visible:ring-2 focus-visible:outline-none'

/**
 * A word in a chapter that the glossary explains. Tapping it, or resting the mouse on it, shows a
 * small card under it with the entry's summary and links to the chapter that explains it and to
 * the glossary. Escape or a tap anywhere else closes the card. An id the glossary does not have
 * shows the words plainly.
 */
export function Term({ id, children }: { id: string; children: ReactNode }) {
  const entry = glossaryEntry(id)
  const cardId = useId()
  const wrapperRef = useRef<HTMLSpanElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const cardRef = useRef<HTMLSpanElement>(null)
  // How the card was opened: a mouse resting on the word closes it again when the mouse leaves.
  const [open, setOpen] = useState<'tap' | 'hover' | undefined>()
  const [left, setLeft] = useState(0)

  useEffect(() => {
    if (!entry && import.meta.env.DEV) console.error(`<Term id="${id}">: no glossary entry`)
  }, [entry, id])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(undefined)
      buttonRef.current?.focus()
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(undefined)
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  // Starts the card under the word, moved sideways as far as needed to stay on the screen.
  useLayoutEffect(() => {
    if (!open) return
    const place = () => {
      const wrapper = wrapperRef.current
      const card = cardRef.current
      if (!wrapper || !card) return
      const screenWidth = document.documentElement.clientWidth
      const wordLeft = wrapper.getBoundingClientRect().left
      const highest = screenWidth - SCREEN_MARGIN - card.offsetWidth
      setLeft(Math.max(SCREEN_MARGIN, Math.min(wordLeft, highest)) - wordLeft)
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [open])

  if (!entry) return <>{children}</>

  const chapterPost = getSeriesPostsByPart(GLOSSARY_SERIES).get(entry.chapter)
  const explained = `Explained in chapter ${entry.chapter}`

  return (
    <span
      ref={wrapperRef}
      className="relative"
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse' && !open) setOpen('hover')
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse' && open === 'hover') setOpen(undefined)
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open !== undefined}
        aria-controls={cardId}
        onClick={() => setOpen((current) => (current === 'tap' ? undefined : 'tap'))}
        // The space above and below the word also takes the tap, so the target is 44px tall.
        className="text-primary focus-visible:outline-ring relative cursor-pointer rounded-sm underline decoration-dotted decoration-2 underline-offset-4 before:absolute before:inset-x-0 before:-inset-y-2 before:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {children}
      </button>
      <span
        ref={cardRef}
        id={cardId}
        hidden={!open}
        style={{ left }}
        className="not-prose bg-popover text-popover-foreground absolute top-full z-30 mt-2 block w-[min(20rem,calc(100vw-2rem))] rounded-xl border p-4 text-left font-sans text-base leading-normal font-normal shadow-md"
      >
        <span className="block font-bold">{entry.term}</span>
        <span className="mt-1 block">{entry.summary}</span>
        <span className="mt-2 flex flex-wrap gap-x-4">
          {chapterPost ? (
            <Link to={`/blog/${chapterPost.slug}`} className={cardLinkClass}>
              {explained}
            </Link>
          ) : (
            <span className="text-muted-foreground inline-flex min-h-11 items-center">
              {explained}
            </span>
          )}
          <Link to={glossaryAddress(entry.id)} className={cardLinkClass}>
            Glossary
          </Link>
        </span>
      </span>
    </span>
  )
}
