import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { TryIt } from '@/components/ai-series/try-it'
import { cn } from '@/lib/utils'
import { inHundred } from '@/lib/ai-series/language/format'
import {
  displayChoice,
  lastChoice,
  matchGuess,
  nodeAt,
  sentenceParts,
  type NextChoice,
  type NextNode,
  type NextWordsData,
} from '@/lib/ai-series/language/next-words'

const LOAD_FAILED = 'This did not load. Check your connection and reload the page.'

type Load = { status: 'loading' } | { status: 'failed' } | { status: 'ready'; data: NextWordsData }

function useNextWords(): Load {
  const [load, setLoad] = useState<Load>({ status: 'loading' })
  useEffect(() => {
    let cancelled = false
    import('@/lib/ai-series/language/next-words.json').then(
      (module) => {
        if (!cancelled) setLoad({ status: 'ready', data: module.default as NextWordsData })
      },
      () => {
        if (!cancelled) setLoad({ status: 'failed' })
      },
    )
    return () => {
      cancelled = true
    }
  }, [])
  return load
}

/** The reader guesses the next word, then sees what a real model gave, and builds a sentence. */
export function YouBeTheAutocomplete() {
  const load = useNextWords()
  return (
    <TryIt title="You be the autocomplete">
      <p className="mb-6 text-base">
        Your phone suggests the next word as you type. A language model does the same, with a
        likelihood for every word. Guess first, then see what a real model said.
      </p>
      {load.status === 'loading' && <p className="text-muted-foreground text-base">Loading…</p>}
      {load.status === 'failed' && <p className="text-base">{LOAD_FAILED}</p>}
      {load.status === 'ready' && <Game data={load.data} />}
    </TryIt>
  )
}

/** A stacked radio group of starting texts, shared by the chapter's two interactives. */
export function StartPicker({
  idPrefix,
  starts,
  chosen,
  onChoose,
}: {
  idPrefix: string
  starts: string[]
  chosen: number
  onChoose: (index: number) => void
}) {
  const headingId = `${idPrefix}-start-heading`

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
    const target = (index + step + buttons.length) % buttons.length
    buttons[target].focus()
    onChoose(target)
  }

  return (
    <section className="mb-6">
      <h4 id={headingId} className="mb-3 text-lg font-semibold">
        Start with
      </h4>
      <div
        role="radiogroup"
        aria-labelledby={headingId}
        onKeyDown={onKeyDown}
        className="flex flex-col gap-2"
      >
        {starts.map((text, index) => {
          const checked = index === chosen
          return (
            <button
              key={text}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={checked ? 0 : -1}
              onClick={() => onChoose(index)}
              className={cn(
                'bg-background text-foreground hover:bg-muted focus-visible:ring-ring/50 focus-visible:border-ring min-h-12 w-full rounded-lg border px-4 py-2 text-left text-base break-words outline-none focus-visible:ring-3',
                checked ? 'border-primary border-4 px-3.5 py-1.5 font-semibold' : 'border-input',
              )}
            >
              {checked && <span aria-hidden="true">{'✓ '}</span>}
              {text}…
            </button>
          )
        })}
      </div>
    </section>
  )
}

type Guess = { stage: 'guess' } | { stage: 'answer'; guess: string }

function Game({ data }: { data: NextWordsData }) {
  const [startIndex, setStartIndex] = useState(0)
  const [path, setPath] = useState<number[]>([])
  const [round, setRound] = useState<Guess>({ stage: 'guess' })
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const answerRef = useRef<HTMLHeadingElement>(null)
  const afterTap = useRef(false)

  const start = data.starts[startIndex]
  const node: NextNode | undefined = nodeAt(start.node, path)
  const taken = lastChoice(start.node, path)
  const words: string[] = []
  for (let i = 1; i <= path.length; i++) {
    const choice = lastChoice(start.node, path.slice(0, i))
    if (choice) words.push(choice.word)
  }
  const stopped = path.length > 0 && !node

  useEffect(() => {
    if (round.stage === 'answer') answerRef.current?.focus()
  }, [round.stage])

  useEffect(() => {
    if (afterTap.current && round.stage === 'guess') {
      afterTap.current = false
      inputRef.current?.focus()
    }
  }, [round.stage, path])

  function restart(index: number) {
    setStartIndex(index)
    setPath([])
    setRound({ stage: 'guess' })
    setDraft('')
  }

  function reveal(skip: boolean) {
    setRound({ stage: 'answer', guess: skip ? '' : draft.trim() })
  }

  function take(index: number) {
    afterTap.current = true
    setPath([...path, index])
    setRound({ stage: 'guess' })
    setDraft('')
  }

  const topWord = node ? displayChoice(node.choices[0]).text : ''

  return (
    <div className="space-y-6 text-base">
      <StartPicker
        idPrefix="autocomplete"
        starts={data.starts.map((s) => s.text)}
        chosen={startIndex}
        onChoose={restart}
      />

      <section aria-label="The sentence so far">
        <p className="text-2xl leading-snug break-words">
          {sentenceParts(start.text, words).map((part, i) =>
            part.added ? (
              <strong key={i} className="font-bold">
                {part.text}
              </strong>
            ) : (
              <span key={i}>{part.text}</span>
            ),
          )}
          {!stopped && <span className="whitespace-nowrap"> ____</span>}
        </p>
      </section>

      <p role="status" className="sr-only">
        {round.stage === 'answer' && node ? `The model's top word is “${topWord}”.` : ''}
      </p>

      {stopped && taken && (
        <section className="space-y-4">
          <p className="font-medium">
            {taken.ends
              ? 'The model ended the sentence there.'
              : 'That is as far as this recording goes.'}
          </p>
          <Button className="h-12 px-5 text-base" onClick={() => restart(startIndex)}>
            Start again
          </Button>
        </section>
      )}

      {node && round.stage === 'guess' && (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            reveal(false)
          }}
        >
          <label className="block">
            <span className="mb-2 block text-lg font-semibold">What word comes next?</span>
            <input
              ref={inputRef}
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="done"
              className="border-input bg-background text-foreground focus-visible:ring-ring/50 focus-visible:border-ring block h-12 w-full rounded-lg border px-3 text-lg outline-none focus-visible:ring-3"
            />
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" className="h-12 px-5 text-base">
              See what the model said
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 px-5 text-base"
              onClick={() => reveal(true)}
            >
              Skip the guess
            </Button>
          </div>
        </form>
      )}

      {node && round.stage === 'answer' && (
        <Answer node={node} guess={round.guess} headingRef={answerRef} onTake={take} />
      )}

      {path.length > 0 && !stopped && (
        <Button
          variant="outline"
          className="h-11 px-4 text-base"
          onClick={() => restart(startIndex)}
        >
          Start again
        </Button>
      )}

      <p className="text-muted-foreground text-sm">
        These are real outputs of GPT-2, a language model from 2019, recorded for this page. The
        model works in pieces of words. Most everyday words are one piece. A long or unusual word is
        split into two or more.
      </p>
    </div>
  )
}

function Answer({
  node,
  guess,
  headingRef,
  onTake,
}: {
  node: NextNode
  guess: string
  headingRef: React.RefObject<HTMLHeadingElement | null>
  onTake: (index: number) => void
}) {
  const largest = Math.max(node.other, ...node.choices.map((c) => c.p))
  const matched = guess === '' ? -1 : matchGuess(guess, node.choices)

  return (
    <section className="space-y-3">
      <h4 ref={headingRef} tabIndex={-1} className="text-xl font-semibold outline-none">
        The model&apos;s top four
      </h4>
      {guess !== '' && (
        <p>
          {matched >= 0
            ? `Your guess, “${guess}”, was the model's number ${matched + 1} choice.`
            : `Your guess, “${guess}”, was not in the model's top four. It is somewhere in “every other word”.`}
        </p>
      )}
      <ul className="space-y-2">
        {node.choices.map((choice, index) => (
          <li key={choice.word}>
            <ChoiceRow choice={choice} largest={largest} onTake={() => onTake(index)} />
          </li>
        ))}
        <li className="border-input rounded-lg border border-dashed px-4 py-3">
          <RowBody label="Every other word put together" value={node.other} largest={largest} />
        </li>
      </ul>
      <p className="text-muted-foreground">Tap a word to add it to the sentence.</p>
    </section>
  )
}

function ChoiceRow({
  choice,
  largest,
  onTake,
}: {
  choice: NextChoice
  largest: number
  onTake: () => void
}) {
  const shown = displayChoice(choice)
  return (
    <button
      type="button"
      onClick={onTake}
      className="bg-background text-foreground hover:bg-muted focus-visible:ring-ring/50 focus-visible:border-ring border-input min-h-12 w-full rounded-lg border px-4 py-3 text-left outline-none focus-visible:ring-3"
    >
      <RowBody
        label={
          <>
            <span className="text-lg font-semibold">{shown.text}</span>
            {shown.name && <span className="text-muted-foreground"> {shown.name}</span>}
          </>
        }
        value={choice.p}
        largest={largest}
        note={choice.pieces && choice.pieces > 1 ? `built from ${choice.pieces} pieces` : undefined}
      />
    </button>
  )
}

function RowBody({
  label,
  value,
  largest,
  note,
}: {
  label: React.ReactNode
  value: number
  largest: number
  note?: string
}) {
  return (
    <>
      <span className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 break-words">{label}</span>
        <span className="shrink-0 tabular-nums">{inHundred(value)}</span>
      </span>
      {note && <span className="text-muted-foreground block text-sm">{note}</span>}
      <span aria-hidden="true" className="bg-muted mt-2 block h-3 overflow-hidden rounded-sm">
        <span
          className="bg-primary block h-full"
          style={{ width: `${largest > 0 ? (value / largest) * 100 : 0}%` }}
        />
      </span>
    </>
  )
}
