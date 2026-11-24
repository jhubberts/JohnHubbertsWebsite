import { Fragment, useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { TryIt } from '@/components/ai-series/try-it'
import {
  PLACES,
  READ_ON,
  SOURCES,
  STEPS,
  type IncidentStep,
  type SourceId,
} from '@/lib/ai-series/incident/steps'
import { cn } from '@/lib/utils'

const LAST = STEPS.length - 1
const SOURCE_BY_ID = Object.fromEntries(SOURCES.map((source) => [source.id, source])) as Record<
  SourceId,
  (typeof SOURCES)[number]
>

/** Chapter 12's interactive: the July 2026 incident, one step at a time, each in the reports' words. */
export function TheIncident() {
  const [index, setIndex] = useState(0)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const moved = useRef(false)
  const step = STEPS[index]

  // After a change of step, put keyboard focus on the new heading and keep it in view.
  useEffect(() => {
    if (!moved.current) return
    const heading = headingRef.current
    if (!heading) return
    heading.focus({ preventScroll: true })
    const { top, bottom } = heading.getBoundingClientRect()
    if (top < 0 || bottom > window.innerHeight) heading.scrollIntoView({ block: 'nearest' })
  }, [index])

  function goTo(next: number) {
    moved.current = true
    setIndex(Math.min(LAST, Math.max(0, next)))
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
    const target = event.target as HTMLElement
    if (target.closest('input, select, textarea, [role="slider"], [contenteditable="true"]')) return
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault()
      goTo(index - 1)
    } else if (event.key === 'ArrowRight' && index < LAST) {
      event.preventDefault()
      goTo(index + 1)
    }
  }

  return (
    <TryIt title="The July 2026 incident, step by step">
      {/* The arrow keys are a shortcut for the buttons below, which do the same with a finger. */}
      <div className="space-y-5 text-base" onKeyDown={onKeyDown}>
        <p>Nine steps. Each one says whose account it is, in their own words.</p>
        <Picture step={step} number={index + 1} />
        <StepText key={step.id} step={step} number={index + 1} headingRef={headingRef} />
        <Controls index={index} onGo={goTo} />
        <Reports />
      </div>
    </TryIt>
  )
}

function Picture({ step, number }: { step: IncidentStep; number: number }) {
  const reached = PLACES.filter((place) => step.reached.includes(place.id))
  const notReached = PLACES.filter((place) => !step.reached.includes(place.id))
  const label =
    `Step ${number} of ${STEPS.length}. The agents have reached: ` +
    `${reached.map((place) => place.name).join(', ')}.` +
    (notReached.length > 0
      ? ` Not reached: ${notReached.map((place) => place.name).join(', ')}.`
      : '')

  return (
    <div
      role="img"
      aria-label={label}
      className="flex flex-col items-stretch sm:flex-row sm:items-stretch"
    >
      {PLACES.map((place, i) => {
        const isReached = step.reached.includes(place.id)
        const isFocus = step.focus === place.id
        const joined = i > 0 && isReached
        return (
          <Fragment key={place.id}>
            {i > 0 && (
              <div
                aria-hidden
                className={cn(
                  'border-foreground self-center border-l-2 sm:border-t-2 sm:border-l-0',
                  'h-2 w-0 sm:h-0 sm:w-5 sm:shrink-0',
                  joined ? 'border-solid' : 'border-dashed',
                )}
              />
            )}
            <div
              className={cn(
                'min-w-0 flex-1 rounded-lg break-words',
                isFocus
                  ? 'border-foreground border-4 px-[10px] py-[6px] sm:p-[10px]'
                  : 'border-2 px-3 py-2 sm:p-3',
                isReached
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-card-foreground border-muted-foreground',
                isFocus && 'border-foreground',
              )}
            >
              {/* On a phone each place is one compact row, so the step's text stays in view. */}
              <div className="flex items-baseline justify-between gap-3 sm:block">
                <p className="font-bold">{place.name}</p>
                <p className="mt-1 hidden text-sm sm:block">{place.detail}</p>
                <p className="text-right text-sm font-semibold sm:mt-2 sm:text-left">
                  {isReached ? 'agents here' : 'not reached'}
                  {isFocus && <span className="block underline">this step</span>}
                </p>
              </div>
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}

function StepText({
  step,
  number,
  headingRef,
}: {
  step: IncidentStep
  number: number
  headingRef: React.RefObject<HTMLHeadingElement | null>
}) {
  // The component is keyed by step, so this starts closed again on every new step.
  const [quotesOpen, setQuotesOpen] = useState(false)
  const quotesId = useId()

  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-sm font-medium">
        Step {number} of {STEPS.length}
      </p>
      <h4
        ref={headingRef}
        tabIndex={-1}
        className="focus-visible:outline-ring text-xl font-semibold outline-offset-4"
      >
        {step.title}
      </h4>
      {step.body.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      <h5 className="pt-1">
        <Button
          variant="outline"
          className="h-auto min-h-11 px-4 text-base font-bold"
          aria-expanded={quotesOpen}
          aria-controls={quotesId}
          onClick={() => setQuotesOpen(!quotesOpen)}
        >
          <span aria-hidden>{quotesOpen ? '▾' : '▸'}</span>
          In their words ({step.quotes.length})
        </Button>
      </h5>
      <div id={quotesId} hidden={!quotesOpen} className="space-y-3">
        {step.quotes.map((quote) => {
          const source = SOURCE_BY_ID[quote.source]
          return (
            <blockquote key={quote.text} className="border-border border-l-4 pl-4">
              <p>“{quote.text}”</p>
              <p className="text-muted-foreground mt-1 text-sm">
                — {source.name}, {source.date}
              </p>
            </blockquote>
          )
        })}
      </div>
      <p>
        <span className="font-semibold">Who says so:</span> {step.whoSaysSo}
      </p>
      {step.note && (
        <div className="border-border rounded-xl border-2 p-4">
          <h5 className="font-bold">Take care</h5>
          <p className="mt-1">{step.note}</p>
        </div>
      )}
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
        <span className="text-muted-foreground mr-1 text-sm">Jump to a step:</span>
        {STEPS.map((step, i) => {
          const current = i === index
          return (
            <Button
              key={step.id}
              variant={current ? 'default' : 'outline'}
              size="icon"
              className={cn('size-11 text-base', current && 'font-bold')}
              aria-current={current ? 'step' : undefined}
              aria-label={`Step ${i + 1}: ${step.title}`}
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

function Reports() {
  return (
    <section className="border-border space-y-3 border-t pt-4">
      <h4 className="text-lg font-bold">The three reports</h4>
      <ul className="space-y-3">
        {SOURCES.map((source) => (
          <li key={source.id} className="break-words">
            <span className="font-bold">{source.name}</span> {source.who}{' '}
            <a
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline underline-offset-2"
            >
              {source.title}
            </a>{' '}
            ({source.date})
          </li>
        ))}
      </ul>
      <p className="text-muted-foreground text-sm">
        Read on {READ_ON}. Every quotation above is copied from one of them.
      </p>
    </section>
  )
}
