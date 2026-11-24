import { useState } from 'react'
import { TryIt } from '@/components/ai-series/try-it'
import { GuessChoiceCard } from '@/components/blog/how-ai-works/guess-choice-card'
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
const SAVED_NOTE = 'Your guesses are saved on this device only. Chapter 15 shows them to you again.'
const NOT_SAVED_NOTE = 'Your guesses cannot be saved in this browser. You can still pick.'

/** The reader's guess at each of the series' five opening questions, kept in her browser. */
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
            <GuessChoiceCard
              key={question.id}
              question={question}
              chosen={guesses[question.id]}
              onPick={(choiceId) => pick(question, choiceId)}
              chosenNote="Your guess"
            >
              {when === 'after' && (
                <p className="text-muted-foreground mt-3 text-base">
                  {earlier ? `Before, you guessed: ${earlier.label}` : 'You did not guess before.'}
                </p>
              )}
            </GuessChoiceCard>
          )
        })}
        <p className="text-muted-foreground text-sm">{saveFailed ? NOT_SAVED_NOTE : SAVED_NOTE}</p>
      </div>
    </TryIt>
  )
}
