import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { TryIt } from '@/components/ai-series/try-it'
import { BUILD_MOMENTS, CAUGHT_BY_LABEL, type BuildMoment } from '@/lib/ai-series/making/moments'
import { cn } from '@/lib/utils'

const LAST = BUILD_MOMENTS.length - 1

/** Chapter 14's tap-through: eight moments from the day the series was made, one at a time. */
export function HowItWasBuilt() {
  const [index, setIndex] = useState(0)
  const [announcement, setAnnouncement] = useState('')
  const headingRef = useRef<HTMLHeadingElement>(null)
  const moved = useRef(false)
  const moment = BUILD_MOMENTS[index]

  // After a change of moment, put keyboard focus on the new heading and keep it in view.
  useEffect(() => {
    if (!moved.current) return
    const heading = headingRef.current
    if (!heading) return
    heading.focus({ preventScroll: true })
    const { top, bottom } = heading.getBoundingClientRect()
    if (top < 0 || bottom > window.innerHeight) heading.scrollIntoView({ block: 'nearest' })
  }, [index])

  function goTo(next: number) {
    const clamped = Math.min(LAST, Math.max(0, next))
    moved.current = true
    setIndex(clamped)
    setAnnouncement(
      `Moment ${clamped + 1} of ${BUILD_MOMENTS.length}: ${BUILD_MOMENTS[clamped].title}`,
    )
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault()
      goTo(index - 1)
    } else if (event.key === 'ArrowRight' && index < LAST) {
      event.preventDefault()
      goTo(index + 1)
    }
  }

  return (
    <TryIt title="How it was built">
      {/* The arrow keys are a shortcut for the buttons below, which do the same with a finger. */}
      <div className="space-y-5 text-base" onKeyDown={onKeyDown}>
        <p>Eight moments from the day this series was made. Tap Next to go through them.</p>
        <MomentText moment={moment} number={index + 1} headingRef={headingRef} />
        <Controls index={index} onGo={goTo} />
        <p role="status" className="sr-only">
          {announcement}
        </p>
      </div>
    </TryIt>
  )
}

function MomentText({
  moment,
  number,
  headingRef,
}: {
  moment: BuildMoment
  number: number
  headingRef: React.RefObject<HTMLHeadingElement | null>
}) {
  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-sm font-medium">
        Moment {number} of {BUILD_MOMENTS.length}
      </p>
      <h4
        ref={headingRef}
        tabIndex={-1}
        className="focus-visible:outline-ring text-xl font-semibold outline-offset-4"
      >
        {moment.title}
      </h4>
      {moment.johnSaid && (
        <blockquote className="border-border border-l-4 pl-4">
          <p className="text-muted-foreground text-sm">What I typed:</p>
          <p className="mt-1">“{moment.johnSaid}”</p>
        </blockquote>
      )}
      {moment.body.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      <p className="border-primary border-l-4 pl-4">
        <span className="font-bold">{CAUGHT_BY_LABEL[moment.caughtBy]}.</span> {moment.caughtDetail}
      </p>
    </div>
  )
}

function Controls({ index, onGo }: { index: number; onGo: (next: number) => void }) {
  const last = index === LAST
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="h-12 min-w-0 flex-1 px-5 text-base"
          disabled={index === 0}
          onClick={() => onGo(index - 1)}
        >
          Back
        </Button>
        <Button
          className="h-12 min-w-0 flex-1 px-5 text-base"
          onClick={() => onGo(last ? 0 : index + 1)}
        >
          {last ? 'Start again' : 'Next'}
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground mr-1 text-sm">Jump to a moment:</span>
        {BUILD_MOMENTS.map((moment, i) => {
          const current = i === index
          return (
            <Button
              key={moment.id}
              variant={current ? 'default' : 'outline'}
              size="icon"
              className={cn('size-11 text-base', current && 'font-bold')}
              aria-current={current ? 'step' : undefined}
              aria-label={`Moment ${i + 1}: ${moment.title}`}
              onClick={() => onGo(i)}
            >
              {i + 1}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
