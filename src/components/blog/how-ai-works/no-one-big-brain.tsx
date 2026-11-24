import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { TryIt } from '@/components/ai-series/try-it'
import {
  BRAIN_MESSAGES,
  BRAIN_STEPS,
  CHIPS_IN_ONE_COPY,
  type BrainPicture,
} from '@/lib/ai-series/chat/no-one-big-brain'
import { cn } from '@/lib/utils'

const LAST = BRAIN_STEPS.length - 1
const PEOPLE = ['Person 1', 'Person 2', 'Person 3']
const CHIPS_PER_MACHINE = CHIPS_IN_ONE_COPY / 2

const PICTURE_LABELS: Record<BrainPicture, string> = {
  messages:
    'Three speech bubbles, one from each of three people, each holding a different message.',
  copies:
    'Each of the three messages has an arrow to its own copy of the model, with two more faded copies beside them and the words and many more.',
  chips:
    'Three messages arrive at one copy of the model, drawn as one large box made of sixteen chips split between two machines.',
  forget:
    'The copy of the model is now empty and says nothing kept; a new message goes to another copy, along with a document holding the whole conversation.',
}

/** Chapter 5's tap-through: where a message goes when you press send, one step at a time. */
export function NoOneBigBrain() {
  const [index, setIndex] = useState(0)
  const [announcement, setAnnouncement] = useState('')
  const headingRef = useRef<HTMLHeadingElement>(null)
  const moved = useRef(false)
  const step = BRAIN_STEPS[index]

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
    const clamped = Math.min(LAST, Math.max(0, next))
    moved.current = true
    setIndex(clamped)
    setAnnouncement(`Step ${clamped + 1} of ${BRAIN_STEPS.length}: ${BRAIN_STEPS[clamped].title}`)
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

  const last = index === LAST

  return (
    <TryIt title="No one big brain">
      {/* The arrow keys are a shortcut for the buttons below, which do the same with a finger. */}
      <div className="space-y-5 text-base" onKeyDown={onKeyDown}>
        <p>Where your message goes when you press send. Tap Next.</p>
        <div className="space-y-3">
          <p className="text-muted-foreground text-sm font-medium">
            Step {index + 1} of {BRAIN_STEPS.length}
          </p>
          <h4
            ref={headingRef}
            tabIndex={-1}
            className="focus-visible:outline-ring text-xl font-semibold outline-offset-4"
          >
            {step.title}
          </h4>
          <div
            role="img"
            aria-label={PICTURE_LABELS[step.id]}
            className="flex min-h-96 flex-col justify-center py-2"
          >
            <Picture id={step.id} />
          </div>
          {step.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="h-12 min-w-0 flex-1 px-5 text-base"
            disabled={index === 0}
            onClick={() => goTo(index - 1)}
          >
            Back
          </Button>
          <Button
            className="h-12 min-w-0 flex-1 px-5 text-base"
            onClick={() => goTo(last ? 0 : index + 1)}
          >
            {last ? 'Start again' : 'Next'}
          </Button>
        </div>
        <p role="status" className="sr-only">
          {announcement}
        </p>
      </div>
    </TryIt>
  )
}

function Picture({ id }: { id: BrainPicture }) {
  switch (id) {
    case 'messages':
      return <Messages />
    case 'copies':
      return <Copies />
    case 'chips':
      return <Chips />
    case 'forget':
      return <Forget />
  }
}

function Bubble({
  label,
  children,
  className,
}: {
  label: string
  children?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'bg-secondary text-secondary-foreground border-primary min-w-0 rounded-2xl rounded-bl-sm border-2 px-3 py-2',
        className,
      )}
    >
      <p className="text-sm font-bold">{label}</p>
      {children}
    </div>
  )
}

function ModelBox({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'bg-muted text-foreground border-foreground/60 min-w-0 rounded-lg border-2 px-3 py-2',
        className,
      )}
    >
      {children}
    </div>
  )
}

function ArrowRight() {
  return (
    <svg viewBox="0 0 24 12" className="text-foreground h-3 w-6 shrink-0" aria-hidden="true">
      <path d="M0 6H20M14 1L22 6L14 11" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function ArrowDown() {
  return (
    <svg viewBox="0 0 12 24" className="text-foreground h-6 w-3 shrink-0" aria-hidden="true">
      <path d="M6 0V20M1 14L6 22L11 14" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function Messages() {
  return (
    <div className="space-y-3">
      {BRAIN_MESSAGES.map((message, i) => (
        <Bubble key={message} label={PEOPLE[i]}>
          <p className="text-base">{message}</p>
        </Bubble>
      ))}
    </div>
  )
}

function Copies() {
  return (
    <div className="space-y-3">
      {BRAIN_MESSAGES.map((message, i) => (
        <div key={message} className="flex items-center gap-2">
          <Bubble label={PEOPLE[i]} className="w-[45%] shrink-0">
            <p className="truncate text-sm">{message}</p>
          </Bubble>
          <ArrowRight />
          <ModelBox className="flex min-h-12 flex-1 items-center">
            <p className="text-sm font-medium">Copy of the model</p>
          </ModelBox>
        </div>
      ))}
      {[0, 1].map((n) => (
        <div key={n} className="flex items-center gap-2 opacity-60">
          <div className="w-[45%] shrink-0" />
          <div className="w-6 shrink-0" />
          <ModelBox className="flex min-h-12 flex-1 items-center border-dashed">
            <p className="text-sm font-medium">Copy of the model</p>
          </ModelBox>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <div className="w-[45%] shrink-0" />
        <div className="w-6 shrink-0" />
        <p className="flex-1 text-sm font-medium">…and many more</p>
      </div>
    </div>
  )
}

function Chips() {
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-around gap-2">
        {PEOPLE.map((person) => (
          <div key={person} className="flex flex-col items-center gap-1">
            <Bubble label={person} className="px-2 py-1" />
            <ArrowDown />
          </div>
        ))}
      </div>
      <ModelBox className="space-y-2 px-2 py-3">
        <p className="text-center text-sm font-bold">One copy of the model</p>
        <div className="grid grid-cols-2 gap-2">
          {['Machine 1', 'Machine 2'].map((machine) => (
            <div key={machine} className="border-border bg-card min-w-0 rounded-md border-2 p-2">
              <p className="mb-2 text-center text-sm font-semibold">{machine}</p>
              <div className="grid grid-cols-2 gap-1">
                {Array.from({ length: CHIPS_PER_MACHINE }, (_, n) => (
                  <div
                    key={n}
                    className="border-primary bg-secondary text-secondary-foreground flex h-9 items-center justify-center rounded border-2 text-xs font-medium"
                  >
                    chip
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ModelBox>
    </div>
  )
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 30" className="text-foreground h-8 w-6 shrink-0" aria-hidden="true">
      <path
        d="M2 1H15L22 8V29H2Z M15 1V8H22 M6 14H18 M6 19H18 M6 24H14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Forget() {
  return (
    <div className="space-y-4">
      <ModelBox className="border-dashed px-3 py-3">
        <p className="text-sm font-bold">One copy of the model</p>
        <p className="text-muted-foreground mt-3 mb-1 text-center text-base font-medium">
          Nothing kept
        </p>
      </ModelBox>
      <div className="flex items-center gap-2">
        <Bubble label="Your next message" className="w-[38%] shrink-0" />
        <ArrowRight />
        <ModelBox className="flex-1">
          <p className="text-sm font-bold">Another copy</p>
          <div className="mt-2 flex items-center gap-2">
            <DocumentIcon />
            <p className="text-sm">The whole conversation</p>
          </div>
        </ModelBox>
      </div>
    </div>
  )
}
