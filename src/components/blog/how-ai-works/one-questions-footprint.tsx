import { useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { TryIt } from '@/components/ai-series/try-it'
import {
  ANSWER_FIGURES,
  COMPARISONS,
  HEAVIER_NOTE,
  HEAVIER_REQUESTS,
  QUESTIONS_PER_DAY,
  READ_ON,
  US_TOTALS,
  US_WATER,
  WATER_FIGURES,
  WORLD_TOTALS,
  type AnswerFigure,
  type Basis,
  type Source,
  type Total,
} from '@/lib/ai-series/costs/figures'
import {
  answersFor,
  basisTag,
  partOfWorld,
  twoSignificant,
  yearlyTerawattHours,
} from '@/lib/ai-series/costs/footprint'
import { cn } from '@/lib/utils'

type Tab = 'electricity' | 'water'

const TABS: { tab: Tab; label: string }[] = [
  { tab: 'electricity', label: 'Electricity' },
  { tab: 'water', label: 'Water' },
]

function entry<T extends { id: string }>(list: readonly T[], id: string): T {
  const found = list.find((item) => item.id === id)
  if (!found) throw new Error(`figures.ts has no entry ${id}`)
  return found
}

const LED = entry(COMPARISONS, 'led')
const KETTLE = entry(COMPARISONS, 'kettle')
const WORLD_2025 = entry(WORLD_TOTALS, 'world-2025')
const ALL_TOTALS = [...WORLD_TOTALS, ...US_TOTALS]
const LARGEST_TOTAL = Math.max(...ALL_TOTALS.map((total) => total.terawattHours))

const FOCUS = 'focus-visible:ring-ring/50 outline-none focus-visible:ring-3'
const HEADING = 'mb-3 text-xl font-semibold'

/** Published figures for the electricity and water one chat answer uses, and the totals behind them. */
export function OneQuestionsFootprint() {
  const [tab, setTab] = useState<Tab>('electricity')
  const ids = useId()

  return (
    <TryIt title="One question’s footprint">
      <div className="space-y-4 text-base">
        <p>
          Published figures for what one answer from a chat system uses. Pick whose figure to
          believe, and see what it means.
        </p>
        <Tabs tab={tab} onChange={setTab} ids={ids} />
        <div role="tabpanel" id={`${ids}-panel`} aria-labelledby={`${ids}-tab-${tab}`}>
          {tab === 'electricity' ? <Electricity /> : <Water />}
        </div>
        <p className="text-muted-foreground text-sm">
          Every figure here is someone’s published number, read on {READ_ON}. None of the per-answer
          figures has been checked by an independent auditor.
        </p>
      </div>
    </TryIt>
  )
}

function Tabs({ tab, onChange, ids }: { tab: Tab; onChange(tab: Tab): void; ids: string }) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  function handleKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const next = (index + (event.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length
    onChange(TABS[next].tab)
    tabRefs.current[next]?.focus()
  }

  return (
    <div role="tablist" aria-label="What is used" className="flex flex-wrap gap-2 border-b">
      {TABS.map((item, index) => {
        const selected = item.tab === tab
        return (
          <button
            key={item.tab}
            ref={(element) => {
              tabRefs.current[index] = element
            }}
            type="button"
            role="tab"
            id={`${ids}-tab-${item.tab}`}
            aria-selected={selected}
            aria-controls={`${ids}-panel`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.tab)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              FOCUS,
              '-mb-px min-h-11 rounded-t-lg border-b-2 px-3 text-base',
              selected
                ? 'border-foreground font-semibold'
                : 'text-muted-foreground hover:text-foreground border-transparent',
            )}
          >
            {selected && (
              <span aria-hidden className="mr-1.5">
                ●
              </span>
            )}
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

function Electricity() {
  const [chosen, setChosen] = useState<AnswerFigure>(ANSWER_FIGURES[0])
  const [announcement, setAnnouncement] = useState('')

  function pick(figure: AnswerFigure) {
    setChosen(figure)
    setAnnouncement(`${KETTLE.label} ${answersFor(KETTLE.wattHours, figure.wattHours).wording}`)
  }

  return (
    <div className="space-y-8 pt-4">
      <WhoseFigure chosen={chosen} onPick={pick} />
      <Comparisons chosen={chosen} />
      <div role="status" className="sr-only">
        {announcement}
      </div>
      <HeavierRequests />
      <AddItUp chosen={chosen} />
    </div>
  )
}

function WhoseFigure({
  chosen,
  onPick,
}: {
  chosen: AnswerFigure
  onPick(figure: AnswerFigure): void
}) {
  const headingId = useId()

  function onKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const step =
      event.key === 'ArrowDown' || event.key === 'ArrowRight'
        ? 1
        : event.key === 'ArrowUp' || event.key === 'ArrowLeft'
          ? -1
          : 0
    if (step === 0) return
    event.preventDefault()
    const index = ANSWER_FIGURES.findIndex((figure) => figure.id === chosen.id)
    const next = (index + step + ANSWER_FIGURES.length) % ANSWER_FIGURES.length
    onPick(ANSWER_FIGURES[next])
    event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus()
  }

  return (
    <section>
      <h4 id={headingId} className={HEADING}>
        Electricity for one answer
      </h4>
      <p className="text-muted-foreground mb-4">
        Measured in watt-hours. A watt-hour is a small amount of electricity. An LED light bulb uses
        about {LED.wattHours} of them in an hour.
      </p>
      <div
        role="radiogroup"
        aria-labelledby={headingId}
        onKeyDown={onKeyDown}
        className="flex flex-col gap-3"
      >
        {ANSWER_FIGURES.map((figure) => {
          const checked = figure.id === chosen.id
          return (
            <div
              key={figure.id}
              className={cn(
                'bg-background rounded-lg border',
                checked ? 'border-primary border-4' : 'border-input',
              )}
            >
              <button
                type="button"
                role="radio"
                aria-checked={checked}
                tabIndex={checked ? 0 : -1}
                onClick={() => onPick(figure)}
                className={cn(
                  FOCUS,
                  'hover:bg-muted text-foreground block min-h-12 w-full rounded-t-md px-4 pt-3 pb-2 text-left break-words',
                  checked && 'font-semibold',
                )}
              >
                <span className="block">
                  {checked && <span aria-hidden="true">{'✓ '}</span>}
                  {figure.label}
                </span>
                <span className="mt-1 block font-bold">{figure.shown} watt-hours</span>
                <span className="text-muted-foreground mt-1 block font-normal">
                  {figure.detail}
                </span>
                <BasisTag basis={figure.basis} />
              </button>
              <div className="px-4 pb-1">
                <SourceLine source={figure.source} />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function Comparisons({ chosen }: { chosen: AnswerFigure }) {
  const rows = COMPARISONS.map((comparison) => ({
    comparison,
    answers: answersFor(comparison.wattHours, chosen.wattHours),
  }))
  const largest = Math.max(...rows.map((row) => row.answers.count))

  return (
    <section>
      <h4 className={HEADING}>The same electricity would…</h4>
      <ul className="space-y-5">
        {rows.map(({ comparison, answers }) => (
          <li key={comparison.id}>
            <p>
              {comparison.label} <span className="font-bold">{answers.wording}</span>
            </p>
            <Bar fraction={answers.count / largest} />
            <p className="text-muted-foreground mt-2 text-sm">{comparison.detail}</p>
            {comparison.source && <SourceLine source={comparison.source} />}
          </li>
        ))}
      </ul>
    </section>
  )
}

function HeavierRequests() {
  return (
    <section>
      <h4 className={HEADING}>Not every request is a plain question</h4>
      <ul className="space-y-3">
        {HEAVIER_REQUESTS.map((request) => (
          <li key={request.id} className="border-border rounded-lg border p-4">
            <p className="font-bold">{request.label}</p>
            <p className="mt-1">{request.finding}</p>
            <SourceLine source={request.source} />
          </li>
        ))}
      </ul>
      <p className="text-muted-foreground mt-3">{HEAVIER_NOTE}</p>
    </section>
  )
}

function AddItUp({ chosen }: { chosen: AnswerFigure }) {
  const yearly = yearlyTerawattHours(QUESTIONS_PER_DAY.count, chosen.wattHours)
  const part = partOfWorld(yearly, WORLD_2025.terawattHours)

  return (
    <section className="space-y-3">
      <h4 className={HEADING}>Now add it all up</h4>
      <div>
        <p>ChatGPT answered about {QUESTIONS_PER_DAY.shown} questions a day in July 2025.</p>
        <SourceLine source={QUESTIONS_PER_DAY.source} />
      </div>
      <p>
        If every one of those questions used {chosen.shown} watt-hours, a year of them would come to
        about <span className="font-bold">{twoSignificant(yearly)}</span> terawatt-hours.
      </p>
      <p className="text-muted-foreground">A terawatt-hour is a trillion watt-hours.</p>
      <p>
        All the world’s data centers used {WORLD_2025.terawattHours} terawatt-hours in 2025. On this
        figure, a year of those questions is about{' '}
        <span className="font-bold">1 part in {twoSignificant(part)}</span> of that.
      </p>
      <p>
        The figures for one answer count only answering a text question. They leave out building the
        models, and they leave out pictures, video and “thinking” modes. The totals count everything
        data centers do, AI or not.
      </p>
      <Totals heading="The world" totals={WORLD_TOTALS} />
      <Totals heading="The United States" totals={US_TOTALS} />
    </section>
  )
}

function Totals({ heading, totals }: { heading: string; totals: readonly Total[] }) {
  return (
    <div className="pt-2">
      <h5 className="mb-2 text-lg font-semibold">{heading}</h5>
      <ul className="space-y-4">
        {totals.map((total) => (
          <li key={total.id}>
            <p>{total.label}</p>
            <p className="font-bold">{total.terawattHours} terawatt-hours</p>
            {total.share && <p>{total.share}</p>}
            <Bar fraction={total.terawattHours / LARGEST_TOTAL} />
            <p className="text-muted-foreground mt-2 text-sm">{total.detail}</p>
            <SourceLine source={total.source} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function Water() {
  return (
    <div className="space-y-4 pt-4">
      <h4 className={HEADING}>Water for one answer</h4>
      <p>
        How much depends on what is counted. These four figures count different things, for
        different systems, so they cannot be lined up fairly. They are shown together so you can see
        how far apart they are.
      </p>
      <ul className="space-y-3">
        {WATER_FIGURES.map((figure) => (
          <li key={figure.id} className="border-border rounded-lg border p-4">
            <p className="font-bold">{figure.label}</p>
            <p className="mt-1">
              <span className="font-semibold">Counts:</span> {figure.counts}
            </p>
            <p className="mt-2 flex flex-wrap items-baseline gap-x-3">
              <span className="text-2xl font-semibold">{figure.shown}</span>
              <span>{figure.inKitchenTerms}</span>
            </p>
            <p className="mt-2">{figure.detail}</p>
            <BasisTag basis={figure.basis} />
            <SourceLine source={figure.source} />
          </li>
        ))}
      </ul>
      <p>The largest of these is more than a hundred times the smallest.</p>
      <div>
        <p>{US_WATER.detail}</p>
        <SourceLine source={US_WATER.source} />
      </div>
    </div>
  )
}

function BasisTag({ basis }: { basis: Basis }) {
  const tag = basisTag(basis)
  if (!tag) return null
  return (
    <span className="border-border text-muted-foreground mt-2 inline-block rounded-md border px-2 py-0.5 text-sm font-normal">
      {tag}
    </span>
  )
}

function SourceLine({ source }: { source: Source }) {
  return (
    <p className="text-muted-foreground text-sm">
      Source:{' '}
      {source.url ? (
        <a
          href={source.url}
          target="_blank"
          rel="noreferrer"
          className={cn(FOCUS, 'inline-flex min-h-11 items-center rounded-sm underline')}
        >
          {source.publisher}
        </a>
      ) : (
        source.publisher
      )}
      , {source.date}
    </p>
  )
}

/** A horizontal bar; the number it stands for is always printed beside it, so it is decoration. */
function Bar({ fraction }: { fraction: number }) {
  return (
    <div aria-hidden className="bg-muted mt-2 h-4 overflow-hidden rounded-sm">
      <div className="bg-primary h-full" style={{ width: `${fraction * 100}%` }} />
    </div>
  )
}
