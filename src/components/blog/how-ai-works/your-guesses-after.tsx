import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TryIt } from '@/components/ai-series/try-it'
import { GuessChoiceCard } from '@/components/blog/how-ai-works/guess-choice-card'
import {
  GUESS_QUESTIONS,
  getBrowserStorage,
  readGuesses,
  writeGuess,
  type GuessChoiceId,
  type GuessQuestion,
  type Guesses,
} from '@/lib/ai-series/guesses'
import { CHAPTER_PATHS, compareGuesses } from '@/lib/ai-series/making/compare'
import { SERIES_ANSWERS } from '@/lib/ai-series/making/moments'

function labelOf(question: GuessQuestion, choiceId: GuessChoiceId | undefined) {
  return question.choices.find((c) => c.id === choiceId)?.label
}

function earlierLine(earlier: string | undefined) {
  return earlier === undefined
    ? 'You did not guess this one in chapter 0.'
    : `In chapter 0 you guessed: ${earlier}`
}

/** Chapter 9: the reader answers chapter 0's three questions again and compares. */
export function YourGuessesAfter() {
  const [storage] = useState(getBrowserStorage)
  const [before] = useState<Guesses>(() => readGuesses(storage, 'before'))
  const [after, setAfter] = useState<Guesses>(() => readGuesses(storage, 'after'))
  const [announcement, setAnnouncement] = useState('')

  function pick(question: GuessQuestion, choiceId: GuessChoiceId) {
    setAfter((current) => ({ ...current, [question.id]: choiceId }))
    writeGuess(storage, 'after', question.id, choiceId)
    const earlier = labelOf(question, before[question.id])
    setAnnouncement(`${earlierLine(earlier)} Now you say: ${labelOf(question, choiceId)}`)
  }

  return (
    <TryIt title="Your three questions, again">
      <div className="space-y-6 text-base">
        <p>Answer each one again. Then you will see your guess from chapter 0 beside it.</p>
        {GUESS_QUESTIONS.map((question) => (
          <GuessChoiceCard
            key={question.id}
            question={question}
            chosen={after[question.id]}
            onPick={(choiceId) => pick(question, choiceId)}
          >
            <Result question={question} before={before[question.id]} after={after[question.id]} />
          </GuessChoiceCard>
        ))}
        <p className="text-muted-foreground text-sm">Your answers are saved on this device only.</p>
        <p role="status" className="sr-only">
          {announcement}
        </p>
      </div>
    </TryIt>
  )
}

function Result({
  question,
  before,
  after,
}: {
  question: GuessQuestion
  before: GuessChoiceId | undefined
  after: GuessChoiceId | undefined
}) {
  const comparison = compareGuesses(before, after)
  if (comparison === 'notAnswered') return null
  const found = SERIES_ANSWERS[question.id]

  return (
    <div className="border-border mt-4 space-y-3 rounded-lg border-2 p-4">
      {comparison === 'noEarlierGuess' ? (
        <p>You did not guess this one in chapter 0.</p>
      ) : (
        <p>
          In chapter 0 you guessed: <span className="font-bold">{labelOf(question, before)}</span>
        </p>
      )}
      <p>
        Now you say: <span className="font-bold">{labelOf(question, after)}</span>
      </p>
      {comparison === 'same' && <p>Same answer.</p>}
      {comparison === 'changed' && <p>You changed your answer.</p>}
      <p>
        <span className="font-semibold">What the series found:</span> {found.answer}
      </p>
      <p>
        <Link
          to={CHAPTER_PATHS[found.chapter]}
          className="text-primary inline-flex min-h-11 items-center underline underline-offset-2"
        >
          Chapter {found.chapter}
        </Link>
      </p>
      <p className="text-muted-foreground">
        The closest choice: “{labelOf(question, found.closest)}”
      </p>
    </div>
  )
}
