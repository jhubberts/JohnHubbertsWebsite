import { useId, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react'
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
  addItUpSummary,
  answersFor,
  basisTag,
  partOfWorld,
  totalsSummary,
  twoSignificant,
  waterSummary,
  yearlyTerawattHours,
} from '@/lib/ai-series/costs/footprint'
import { cn } from '@/lib/utils'

function entry<T extends { id: string }>(list: readonly T[], id: string): T {
  const found = list.find((item) => item.id === id)
  if (!found) throw new Error(`figures.ts has no entry ${id}`)
  return found
}

const LED = entry(COMPARISONS, 'led')
const KETTLE = entry(COMPARISONS, 'kettle')
const WORLD_2024 = entry(WORLD_TOTALS, 'world-2024')
const WORLD_2025 = entry(WORLD_TOTALS, 'world-2025')
const WORLD_2030 = entry(WORLD_TOTALS, 'world-2030')
const ALL_TOTALS = [...WORLD_TOTALS, ...US_TOTALS]
const LARGEST_TOTAL = Math.max(...ALL_TOTALS.map((total) => total.terawattHours))
/** The one answer figure that counts a share of building the model. */
const WITH_BUILDING = 'epoch-with-building'

const TOTALS_SUMMARY = totalsSummary(WORLD_2024.share ?? '', WORLD_2030.share ?? '')
const WATER_SUMMARY = waterSummary(WATER_FIGURES, 'mistral')

const FOCUS = 'focus-visible:ring-ring/50 outline-none focus-visible:ring-3'
const HEADING = 'mb-3 text-xl font-semibold'

/**
 * Published figures for the electricity and water one chat answer uses, and the totals behind them.
 * The figure picker and its comparisons are always shown; the rest is in sections that start
 * closed, each with a one-line summary visible while closed.
 */
export function OneQuestionsFootprint() {
  const [chosen, setChosen] = useState<AnswerFigure>(ANSWER_FIGURES[0])
  const [announcement, setAnnouncement] = useState('')

  function pick(figure: AnswerFigure) {
    setChosen(figure)
    setAnnouncement(`${KETTLE.label} ${answersFor(KETTLE.wattHours, figure.wattHours).wording}`)
  }

  return (
    <TryIt title="One question’s footprint">
      <div className="space-y-6 text-base">
        <p>
          Published figures for what one answer from a chat system uses. Pick whose figure to
          believe, and see what it means.
        </p>
        <WhoseFigure chosen={chosen} onPick={pick} />
        <Comparisons chosen={chosen} />
        <div role="status" className="sr-only">
          {announcement}
        </div>
        <div className="space-y-3">
          <Collapsible
            title="Not every request is a plain question"
            summary="A “thinking” mode, a picture or a video uses far more."
          >
            <HeavierRequests />
          </Collapsible>
          <Collapsible
            title="Now add it all up"
            summary={addItUpSummary(
              QUESTIONS_PER_DAY.count,
              chosen.wattHours,
              WORLD_2025.terawattHours,
            )}
          >
            <AddItUp chosen={chosen} />
          </Collapsible>
          <Collapsible title="How much all data centers use" summary={TOTALS_SUMMARY}>
            <Totals heading="The world" totals={WORLD_TOTALS} />
            <Totals heading="The United States" totals={US_TOTALS} />
          </Collapsible>
          <Collapsible title="Water for one answer" summary={WATER_SUMMARY}>
            <Water />
          </Collapsible>
        </div>
        <p className="text-muted-foreground text-sm">
          Every figure here is someone’s published number, read on {READ_ON}. None of the per-answer
          figures has been checked by an independent auditor.
        </p>
      </div>
    </TryIt>
  )
}

/** A section that starts closed. Its title and one-line summary stay visible while it is closed. */
function Collapsible({
  title,
  summary,
  children,
}: {
  title: string
  summary: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const contentId = useId()

  return (
    <section className="border-border rounded-lg border">
      <h4>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={contentId}
          onClick={() => setOpen(!open)}
          className={cn(
            FOCUS,
            'hover:bg-muted flex min-h-12 w-full items-start gap-3 rounded-lg px-4 py-3 text-left',
          )}
        >
          <span aria-hidden className="pt-0.5">
            {open ? '▾' : '▸'}
          </span>
          <span className="min-w-0 break-words">
            <span className="block font-bold">{title}</span>
            <span className="text-muted-foreground mt-1 block">{summary}</span>
          </span>
        </button>
      </h4>
      <div id={contentId} hidden={!open} className="px-4 pt-1 pb-4">
        {children}
      </div>
    </section>
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
        className="flex flex-col gap-2"
      >
        {ANSWER_FIGURES.map((figure) => {
          const checked = figure.id === chosen.id
          return (
            <button
              key={figure.id}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={checked ? 0 : -1}
              onClick={() => onPick(figure)}
              className={cn(
                FOCUS,
                'hover:bg-muted text-foreground bg-background block min-h-12 w-full rounded-lg border px-4 py-2 text-left break-words',
                checked
                  ? 'border-primary border-4 px-[13px] py-[5px] font-semibold'
                  : 'border-input',
              )}
            >
              <span className="block">
                {checked && <span aria-hidden="true">{'✓ '}</span>}
                {figure.label}
              </span>
              <span className="block font-bold">{figure.shown} watt-hours</span>
            </button>
          )
        })}
      </div>
      <div className="border-border bg-muted/40 mt-3 rounded-lg border p-4">
        <p>{chosen.detail}</p>
        <BasisTag basis={chosen.basis} />
        <SourceLine source={chosen.source} />
      </div>
    </section>
  )
}

function Comparisons({ chosen }: { chosen: AnswerFigure }) {
  const [sourcesOpen, setSourcesOpen] = useState(false)
  const sourcesId = useId()
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
          </li>
        ))}
      </ul>
      <button
        type="button"
        aria-expanded={sourcesOpen}
        aria-controls={sourcesId}
        onClick={() => setSourcesOpen(!sourcesOpen)}
        className={cn(
          FOCUS,
          'text-muted-foreground hover:text-foreground mt-3 inline-flex min-h-11 items-center gap-2 rounded-sm text-sm underline underline-offset-2',
        )}
      >
        <span aria-hidden>{sourcesOpen ? '▾' : '▸'}</span>
        Where these come from
      </button>
      <ul id={sourcesId} hidden={!sourcesOpen} className="mt-2 space-y-3">
        {COMPARISONS.map((comparison) => (
          <li key={comparison.id} className="text-muted-foreground text-sm">
            <p className="text-foreground font-semibold">{comparison.label}</p>
            <p>{comparison.detail}</p>
            {comparison.source && <SourceLine source={comparison.source} />}
          </li>
        ))}
      </ul>
    </section>
  )
}

function HeavierRequests() {
  return (
    <div>
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
    </div>
  )
}

function AddItUp({ chosen }: { chosen: AnswerFigure }) {
  const yearly = yearlyTerawattHours(QUESTIONS_PER_DAY.count, chosen.wattHours)
  const part = partOfWorld(yearly, WORLD_2025.terawattHours)

  return (
    <div className="space-y-3">
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
      {chosen.id === WITH_BUILDING && (
        <p>This figure is the exception: it does count a share of building the model.</p>
      )}
    </div>
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
    <div className="space-y-4">
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
