import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { TryIt } from '@/components/ai-series/try-it'
import {
  CARDS,
  runToEnd,
  startProgram,
  step,
  type ProgramState,
} from '@/lib/ai-series/program/program'
import { cn } from '@/lib/utils'

const LAST_CHOICES = [5, 10, 100] as const

/** Chapter 1's six-card program, which the reader carries out one card at a time. */
export function BeTheComputer() {
  const [state, setState] = useState(() => startProgram(5))
  const [announcement, setAnnouncement] = useState('')

  function show(next: ProgramState) {
    setState(next)
    setAnnouncement(next.done ? doneWords(next) : next.millText)
  }

  function chooseLast(last: number) {
    setState(startProgram(last))
    setAnnouncement('')
  }

  return (
    <TryIt title="Be the computer">
      <div className="space-y-6 text-base">
        <p>
          These six cards are a program. It adds up the numbers from 1 to the last number. Tap “Do
          this card” to carry out one card at a time, as the machine would.
        </p>
        <LastChoice last={state.last} onChoose={chooseLast} />
        <Cards state={state} />
        <Store state={state} />
        <section>
          <h4 className="mb-2 text-lg font-semibold">The mill</h4>
          <p className="bg-muted rounded-lg px-4 py-3 font-mono text-lg">{state.millText}</p>
        </section>
        <p className="font-medium">Cards carried out: {state.steps}</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            className="h-12 px-5 text-base sm:flex-1"
            disabled={state.done}
            onClick={() => show(step(state))}
          >
            Do this card
          </Button>
          <Button
            variant="outline"
            className="h-12 px-5 text-base sm:flex-1"
            disabled={state.done}
            onClick={() => show(runToEnd(state))}
          >
            Run to the end
          </Button>
          <Button
            variant="outline"
            className="h-12 px-5 text-base sm:flex-1"
            onClick={() => chooseLast(state.last)}
          >
            Start again
          </Button>
        </div>
        {state.done && <p className="font-semibold">{doneWords(state)}</p>}
        <p className="text-muted-foreground">
          The same six cards work for any last number. Only the number of cards carried out changes.
        </p>
        <p role="status" className="sr-only">
          {announcement}
        </p>
      </div>
    </TryIt>
  )
}

function doneWords(state: ProgramState): string {
  return `Done. The machine carried out ${state.steps} cards and stopped. Total is ${state.total}.`
}

function Cards({ state }: { state: ProgramState }) {
  return (
    <ol className="space-y-2">
      {CARDS.map((text, i) => {
        const current = i + 1 === state.card
        return (
          <li
            key={text}
            aria-current={current ? 'step' : undefined}
            className={cn(
              'flex items-start gap-3 rounded-lg border px-3 py-2.5',
              current ? 'border-primary border-2 px-2.5 py-2 font-bold' : 'border-border',
            )}
          >
            <span className="text-muted-foreground w-5 shrink-0 tabular-nums">{i + 1}.</span>
            <span className="min-w-0 flex-1">{text}</span>
            {current && (
              <span className="text-primary shrink-0 whitespace-nowrap">
                <span aria-hidden="true">◀ </span>now
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}

function Store({ state }: { state: ProgramState }) {
  const boxes: [string, number | null][] = [
    ['Total', state.total],
    ['Next', state.next],
    ['Last', state.last],
  ]
  return (
    <section>
      <h4 className="mb-2 text-lg font-semibold">The store</h4>
      <dl className="grid grid-cols-3 gap-3">
        {boxes.map(([name, value]) => (
          <div key={name} className="border-border rounded-lg border px-2 py-3 text-center">
            <dt className="text-muted-foreground text-sm font-medium">{name}</dt>
            <dd className="mt-1 text-3xl font-semibold tabular-nums">{value ?? '–'}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function LastChoice({ last, onChoose }: { last: number; onChoose: (last: number) => void }) {
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const move =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? -1
          : 0
    if (move === 0) return
    event.preventDefault()
    const choices: readonly number[] = LAST_CHOICES
    const index = (choices.indexOf(last) + move + choices.length) % choices.length
    onChoose(choices[index])
    const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]')
    buttons[index].focus()
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span id="be-the-computer-last" className="font-semibold">
        Last number:
      </span>
      <div
        role="radiogroup"
        aria-labelledby="be-the-computer-last"
        onKeyDown={onKeyDown}
        className="flex gap-2"
      >
        {LAST_CHOICES.map((choice) => {
          const checked = choice === last
          return (
            <button
              key={choice}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={checked ? 0 : -1}
              onClick={() => onChoose(choice)}
              className={cn(
                'bg-background text-foreground hover:bg-muted focus-visible:ring-ring/50 focus-visible:border-ring min-h-12 min-w-16 rounded-lg border px-4 text-base tabular-nums outline-none focus-visible:ring-3',
                checked ? 'border-primary border-4 px-3.5 font-semibold' : 'border-input',
              )}
            >
              {checked && <span aria-hidden="true">{'✓ '}</span>}
              {choice}
            </button>
          )
        })}
      </div>
    </div>
  )
}
