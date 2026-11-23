import { useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { TryIt } from '@/components/ai-series/try-it'
import { cn } from '@/lib/utils'
import {
  GUESS_QUESTIONS,
  getBrowserStorage,
  readGuesses,
  writeGuess,
  type GuessChoiceId,
  type GuessQuestion,
  type GuessWhen,
  type Guesses,
} from '@/lib/ai-series/guesses'

const INTRO: Record<GuessWhen, string> = {
  before: 'Before you read anything, pick your guess for each one. There is no score.',
  after: 'Now that you have read it all, pick again.',
}
const SAVED_NOTE =
  'Your guesses are saved on this device only. The last chapter shows them to you again.'
const NOT_SAVED_NOTE = 'Your guesses cannot be saved in this browser. You can still pick.'

/** The reader's guess at each of the series' three opening questions, kept in her browser. */
export function GuessCards({ when = 'before' }: { when?: GuessWhen }) {
  const [storage] = useState(getBrowserStorage)
  const [guesses, setGuesses] = useState<Guesses>(() => readGuesses(storage, when))
  const [before] = useState<Guesses>(() => (when === 'after' ? readGuesses(storage, 'before') : {}))
  const [saveFailed, setSaveFailed] = useState(storage === null)

  function pick(question: GuessQuestion, choiceId: GuessChoiceId) {
    setGuesses((current) => ({ ...current, [question.id]: choiceId }))
    setSaveFailed(!writeGuess(storage, when, question.id, choiceId))
  }

  return (
    <TryIt title={when === 'before' ? 'Your guess, before' : 'Your guess, after'}>
      <div className="space-y-6 text-base">
        <p>{INTRO[when]}</p>
        {GUESS_QUESTIONS.map((question) => {
          const earlier = question.choices.find((c) => c.id === before[question.id])
          return (
            <Card
              key={question.id}
              question={question}
              chosen={guesses[question.id]}
              onPick={(choiceId) => pick(question, choiceId)}
            >
              {when === 'after' && (
                <p className="text-muted-foreground mt-3 text-base">
                  {earlier ? `Before, you guessed: ${earlier.label}` : 'You did not guess before.'}
                </p>
              )}
            </Card>
          )
        })}
        <p className="text-muted-foreground text-sm">{saveFailed ? NOT_SAVED_NOTE : SAVED_NOTE}</p>
      </div>
    </TryIt>
  )
}

function Card({
  question,
  chosen,
  onPick,
  children,
}: {
  question: GuessQuestion
  chosen: GuessChoiceId | undefined
  onPick: (choiceId: GuessChoiceId) => void
  children?: ReactNode
}) {
  const headingId = `guess-${question.id}-question`
  const choices = question.choices
  // Only one choice is in the tab order: the chosen one, or the first when none is chosen.
  const tabbable = choices.some((c) => c.id === chosen) ? chosen : choices[0].id

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step =
      event.key === 'ArrowDown' || event.key === 'ArrowRight'
        ? 1
        : event.key === 'ArrowUp' || event.key === 'ArrowLeft'
          ? -1
          : 0
    if (step === 0) return
    event.preventDefault()
    const buttons = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]'),
    )
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement)
    if (index === -1) return
    buttons[(index + step + buttons.length) % buttons.length].focus()
  }

  return (
    <div className="border-border rounded-xl border p-4">
      <h4 id={headingId} className="text-2xl font-bold">
        {question.question}
      </h4>
      <p className="mt-2 mb-4">{question.detail}</p>
      <div
        role="radiogroup"
        aria-labelledby={headingId}
        onKeyDown={onKeyDown}
        className="flex flex-col gap-3"
      >
        {choices.map((choice) => {
          const checked = choice.id === chosen
          return (
            <button
              key={choice.id}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={choice.id === tabbable ? 0 : -1}
              onClick={() => onPick(choice.id)}
              className={cn(
                'bg-background text-foreground hover:bg-muted focus-visible:ring-ring/50 focus-visible:border-ring min-h-12 w-full rounded-lg border px-4 py-3 text-left text-base break-words outline-none focus-visible:ring-3',
                checked ? 'border-primary border-4 px-3.5 py-2.5 font-semibold' : 'border-input',
              )}
            >
              <span>
                {checked && <span aria-hidden="true">{'✓ '}</span>}
                {choice.label}
              </span>
              {checked && (
                <span className="text-primary mt-1 block text-sm font-semibold">Your guess</span>
              )}
            </button>
          )
        })}
      </div>
      {children}
    </div>
  )
}
