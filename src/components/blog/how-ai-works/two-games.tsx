import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { TryIt } from '@/components/ai-series/try-it'
import { inHundred } from '@/lib/ai-series/language/format'
import { hiddenWords, roundFor, type FillInData, type Game } from '@/lib/ai-series/language/fill-in'
import { cn } from '@/lib/utils'

const INTRO = 'One sentence, one hidden word, played two ways.'
const UNDER_BOTH =
  'The first game is how BERT was trained. The second is the game that chat systems play: they only ever see what came before, and add one more word.'
const FOOTER = 'Real outputs of BERT (2018) and GPT-2 (2019), recorded for this page.'
const FAILED = 'This did not load. Check your connection and reload the page.'

type Load = { status: 'loading' } | { status: 'failed' } | { status: 'ready'; data: FillInData }

/** The same sentence with one word hidden, answered by a model that sees both sides and one that does not. */
export function TwoGames() {
  const [load, setLoad] = useState<Load>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    import('@/lib/ai-series/language/fill-in.json').then(
      (module) => {
        if (!cancelled) setLoad({ status: 'ready', data: module.default as FillInData })
      },
      () => {
        if (!cancelled) setLoad({ status: 'failed' })
      },
    )
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <TryIt title="Two games">
      {load.status === 'loading' && <p>Loading…</p>}
      {load.status === 'failed' && <p role="alert">{FAILED}</p>}
      {load.status === 'ready' && <Interactive data={load.data} />}
    </TryIt>
  )
}

function Interactive({ data }: { data: FillInData }) {
  const [hidden, setHidden] = useState('street')
  const round = roundFor(data, hidden)

  return (
    <div className="space-y-5 text-base">
      <p>{INTRO}</p>
      <WordChoice words={hiddenWords(data)} value={hidden} onChange={setHidden} />
      <div className="grid gap-5 md:grid-cols-2">
        <GameCard
          heading="Fill in the gap"
          subheading="BERT sees the words on both sides."
          modelName="BERT"
          game={round.bothSides.game}
        >
          <p className="font-mono break-words">{round.bothSides.text}</p>
        </GameCard>
        <GameCard
          heading="Continue from here"
          subheading="GPT-2 sees only the words before the gap."
          modelName="GPT-2"
          game={round.beforeOnly.game}
        >
          <div>
            <p className="font-mono break-words">
              {round.beforeOnly.before} ____{' '}
              <span className="sr-only">The rest of the sentence is hidden from this model.</span>
              <span aria-hidden="true" className="inline-flex flex-wrap gap-1 align-middle">
                {round.beforeOnly.hidden.map((word, index) => (
                  <span
                    key={index}
                    className="bg-muted-foreground/40 inline-block h-4 rounded-sm"
                    style={{ width: `${Math.max(word.length, 1) * 0.6}em` }}
                  />
                ))}
              </span>
            </p>
            <p aria-hidden="true" className="text-muted-foreground mt-1 text-sm">
              the model cannot see the rest
            </p>
          </div>
        </GameCard>
      </div>
      <p>{UNDER_BOTH}</p>
      <p className="text-muted-foreground text-sm">{FOOTER}</p>
    </div>
  )
}

function GameCard({
  heading,
  subheading,
  modelName,
  game,
  children,
}: {
  heading: string
  subheading: string
  modelName: string
  game: Game
  children: React.ReactNode
}) {
  const largest = Math.max(...game.rows.map((r) => r.p))
  const { word, rank, p } = game.real
  return (
    <div className="border-border space-y-3 rounded-xl border p-4">
      <div>
        <h4 className="text-xl font-semibold">{heading}</h4>
        <p className="text-muted-foreground">{subheading}</p>
      </div>
      {children}
      <div>
        <p className="mb-1 font-semibold">{modelName}&apos;s top five</p>
        <ol className="space-y-1">
          {game.rows.map((row, index) => (
            <li key={index} className="flex min-h-8 flex-wrap items-center gap-x-3">
              <span className="w-24 shrink-0 break-words">{row.word}</span>
              <span className="flex min-w-0 flex-1 items-center gap-3">
                <span className="bg-muted block h-3 min-w-12 flex-1 rounded-sm" aria-hidden="true">
                  <span
                    className="bg-primary block h-3 rounded-sm"
                    style={{ width: `${(row.p / largest) * 100}%` }}
                  />
                </span>
                <span className="w-28 shrink-0 text-right text-sm">{inHundred(row.p)}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
      <p>
        {rank <= 5
          ? `The real word, “${word}”, was its number ${rank} choice.`
          : `The real word, “${word}”, was number ${rank} on its list, at ${inHundred(p)}.`}
      </p>
    </div>
  )
}

function WordChoice({
  words,
  value,
  onChange,
}: {
  words: string[]
  value: string
  onChange(word: string): void
}) {
  const groupRef = useRef<HTMLDivElement>(null)

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
      groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]') ?? [],
    )
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement)
    if (index === -1) return
    const next = buttons[(index + step + buttons.length) % buttons.length]
    next.focus()
    next.click()
  }

  return (
    <div>
      <p id="two-games-hide" className="mb-2 font-semibold">
        Hide the word
      </p>
      <div
        ref={groupRef}
        role="radiogroup"
        aria-labelledby="two-games-hide"
        onKeyDown={onKeyDown}
        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        {words.map((word) => {
          const checked = word === value
          return (
            <button
              key={word}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={checked ? 0 : -1}
              onClick={() => onChange(word)}
              className={cn(
                'bg-background text-foreground hover:bg-muted focus-visible:ring-ring/50 focus-visible:border-ring min-h-12 rounded-lg border px-3 py-2 text-base break-words outline-none focus-visible:ring-3',
                checked ? 'border-primary border-4 px-2 font-semibold' : 'border-input',
              )}
            >
              {checked && <span aria-hidden="true">{'✓ '}</span>}
              {word}
            </button>
          )
        })}
      </div>
    </div>
  )
}
