import type { KeyboardEvent, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { GuessChoiceId, GuessQuestion } from '@/lib/ai-series/guesses'

/**
 * One of the series' five questions with its choices as large radio-style buttons. The chosen
 * button is marked with ✓ and bold, and, when `chosenNote` is given, a short line under its label.
 * Anything passed as children is shown under the choices.
 */
export function GuessChoiceCard({
  question,
  chosen,
  onPick,
  chosenNote,
  children,
}: {
  question: GuessQuestion
  chosen: GuessChoiceId | undefined
  onPick: (choiceId: GuessChoiceId) => void
  chosenNote?: string
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
              {checked && chosenNote && (
                <span className="text-primary mt-1 block text-sm font-semibold">{chosenNote}</span>
              )}
            </button>
          )
        })}
      </div>
      {children}
    </div>
  )
}
