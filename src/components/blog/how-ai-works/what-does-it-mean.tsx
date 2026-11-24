import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { TryIt } from '@/components/ai-series/try-it'
import { Button } from '@/components/ui/button'
import {
  attentionList,
  inHundredNumber,
  mostDrawnWord,
  positionOfIt,
  sentenceWords,
  pickedNote,
  type AttentionData,
  type SentenceId,
} from '@/lib/ai-series/language/attention'
import { inHundred } from '@/lib/ai-series/language/format'
import { cn } from '@/lib/utils'

const INTRO =
  'Two sentences that differ by one word. In the first, “it” is the animal. In the second, “it” is the street. Switch between them and watch which words “it” leans on.'
const UNDER_WORDS =
  'The number under each word is how much “it” leans on that word, out of 100. The rest goes to hidden markers the model adds to every sentence. “Show the full list” has them.'
const MARKERS = 'two invisible markers the model adds at the start and end of every sentence'
const FOOTER = 'Real numbers from BERT, a language model from 2018, recorded for this page.'
const FAILED = 'This did not load. Check your connection and reload the page.'

const SENTENCES: { id: SentenceId; label: string }[] = [
  { id: 'A', label: '…too tired.' },
  { id: 'B', label: '…too wide.' },
]

/** The strongest shade a word button gets; the number under the word carries the exact value. */
const MAX_SHADE_PERCENT = 35

type Load = { status: 'loading' } | { status: 'failed' } | { status: 'ready'; data: AttentionData }

/** Two sentences that differ by one word; tap a word to see which others the model draws on. */
export function WhatDoesItMean() {
  const [load, setLoad] = useState<Load>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    import('@/lib/ai-series/language/attention-shown.json').then(
      (module) => {
        if (!cancelled) setLoad({ status: 'ready', data: module.default as AttentionData })
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
    <TryIt title="What does “it” mean?">
      {load.status === 'loading' && <p>Loading…</p>}
      {load.status === 'failed' && <p role="alert">{FAILED}</p>}
      {load.status === 'ready' && <Interactive data={load.data} />}
    </TryIt>
  )
}

function Interactive({ data }: { data: AttentionData }) {
  const [sentence, setSentence] = useState<SentenceId>('A')
  const [listOpen, setListOpen] = useState(false)
  const listId = useId()

  const words = sentenceWords(data, sentence)
  // "it" is in the same place in both sentences.
  const itIndex = positionOfIt(data, 'A')
  const list = attentionList(data, sentence, 'best', itIndex)
  const most = mostDrawnWord(list)

  return (
    <div className="space-y-4 text-base">
      <p>{INTRO}</p>
      <Tabs<SentenceId>
        idPrefix="what-does-it-mean-sentence"
        label="Which sentence"
        tabs={SENTENCES}
        value={sentence}
        onChange={setSentence}
      />
      <ul className="flex flex-wrap gap-2" aria-label="The sentence">
        {words.map((word, i) => {
          const index = i + 1
          const isIt = index === itIndex
          const row = list.rows.find((r) => r.index === index)
          const strength = row ? row.value / list.largest : 0
          return (
            <li
              key={index}
              style={
                row
                  ? {
                      backgroundColor: `color-mix(in oklab, var(--primary) ${Math.round(strength * MAX_SHADE_PERCENT)}%, var(--background))`,
                    }
                  : undefined
              }
              className={cn(
                'text-foreground flex min-h-12 min-w-11 flex-col items-center justify-center rounded-lg border px-2.5 py-1 text-base',
                isIt
                  ? 'border-primary bg-background border-4 px-1.5 font-semibold'
                  : 'border-input',
              )}
            >
              <span>{word}</span>
              {row && (
                <span className="text-xs leading-tight">
                  <span className="sr-only">“it” leans on this word: </span>
                  {inHundredNumber(row.value)}
                </span>
              )}
            </li>
          )
        })}
      </ul>
      <p className="text-muted-foreground text-sm">{UNDER_WORDS}</p>
      {most && (
        <p role="status" className="font-semibold">
          Here “it” leans most on “{most}”.
        </p>
      )}
      <p>{pickedNote(data)}</p>
      <Button
        variant="outline"
        aria-expanded={listOpen}
        aria-controls={listId}
        onClick={() => setListOpen(!listOpen)}
        className="h-auto min-h-12 w-full px-5 py-2 text-base whitespace-normal sm:w-auto"
      >
        {listOpen ? 'Hide the full list' : 'Show the full list'}
      </Button>
      <div id={listId}>
        {listOpen && (
          <>
            <h4 className="mb-2 font-semibold">“it” leans on:</h4>
            <ul className="space-y-1">
              {list.rows.map((row) => (
                <ListRow
                  key={row.index}
                  label={row.label}
                  value={row.value}
                  largest={list.largest}
                  most={row.isMost}
                />
              ))}
              <ListRow label={MARKERS} value={list.markers} largest={list.largest} muted />
            </ul>
          </>
        )}
      </div>
      <p className="text-muted-foreground text-sm">{FOOTER}</p>
    </div>
  )
}

function ListRow({
  label,
  value,
  largest,
  most = false,
  muted = false,
}: {
  label: string
  value: number
  largest: number
  most?: boolean
  muted?: boolean
}) {
  return (
    <li
      className={cn(
        'flex min-h-8 flex-wrap items-center gap-x-3',
        muted && 'text-muted-foreground',
      )}
    >
      <span className={cn('w-40 shrink-0 break-words', most && 'font-semibold')}>
        {label}
        {most && <span className="ml-1.5 text-sm font-semibold">most</span>}
      </span>
      <span className="flex min-w-0 flex-1 items-center gap-3">
        <span className="bg-muted block h-3 min-w-10 flex-1 rounded-sm" aria-hidden="true">
          <span
            className={cn(
              'block h-3 rounded-sm motion-safe:transition-[width] motion-safe:duration-200',
              muted ? 'bg-muted-foreground' : 'bg-primary',
            )}
            style={{ width: `${largest > 0 ? (value / largest) * 100 : 0}%` }}
          />
        </span>
        <span className="w-28 shrink-0 text-right text-sm">{inHundred(value)}</span>
      </span>
    </li>
  )
}

function Tabs<T extends string>({
  idPrefix,
  label,
  tabs,
  value,
  onChange,
}: {
  idPrefix: string
  label: string
  tabs: { id: T; label: string }[]
  value: T
  onChange(value: T): void
}) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  function handleKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const next = (index + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length
    onChange(tabs[next].id)
    tabRefs.current[next]?.focus()
  }

  return (
    <div role="tablist" aria-label={label} className="flex flex-wrap gap-2 border-b">
      {tabs.map((tab, index) => {
        const isSelected = tab.id === value
        return (
          <button
            key={tab.id}
            ref={(element) => {
              tabRefs.current[index] = element
            }}
            type="button"
            role="tab"
            id={`${idPrefix}-${tab.id}`}
            aria-selected={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              'focus-visible:ring-ring/50 -mb-px min-h-11 rounded-t-lg border-b-2 px-3 text-base outline-none focus-visible:ring-3',
              isSelected
                ? 'border-foreground font-semibold'
                : 'text-muted-foreground hover:text-foreground border-transparent',
            )}
          >
            {isSelected && (
              <span aria-hidden className="mr-1.5">
                ●
              </span>
            )}
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
