import * as React from 'react'
import { Tooltip } from '@/components/ui/tooltip'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CallBreakdown } from '@/components/film-room/call-breakdown'
import {
  COVERAGES,
  COVERAGE_IDS,
  PRESSURES,
  PRESSURE_IDS,
  callName,
  type CoverageId,
  type PressureId,
} from '@/lib/film-room/defense'
import { COVERAGE_GUIDE, PRESSURE_GUIDE } from '@/lib/film-room/glossary'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { Guess, Marks, Stats, Tally } from '@/lib/film-room/grading'
import { LEVELS, type Level, type Play } from '@/lib/film-room/play'
import { cn } from '@/lib/utils'

function Choice({
  selected,
  onClick,
  children,
  disabled,
  explanation,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
  disabled: boolean
  /** Shown in a tooltip when the button is pointed at or focused. */
  explanation?: string
}) {
  return (
    <Tooltip
      disabled={!explanation}
      content={explanation}
      trigger={
        <button
          type="button"
          aria-pressed={selected}
          data-answer
          disabled={disabled}
          onClick={onClick}
          className={cn(
            'min-h-11 rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors',
            selected
              ? 'border-primary bg-primary text-primary-foreground'
              : 'bg-background hover:bg-muted',
            disabled && !selected && 'opacity-60',
          )}
        />
      }
    >
      {children}
    </Tooltip>
  )
}

function Question<T extends string>({
  id,
  title,
  options,
  chosen,
  locked,
  onChoose,
  explain,
}: {
  id: string
  title: string
  options: [T, string][]
  chosen: T | undefined
  locked: boolean
  onChoose(value: T): void
  /** Explains an answer, when explanations are on. */
  explain?: (value: T) => string
}) {
  const chosenName = options.find(([value]) => value === chosen)?.[1]
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="text-sm font-semibold">
        {title}
      </h2>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {options.map(([value, name]) => (
          <Choice
            key={value}
            selected={chosen === value}
            disabled={locked}
            onClick={() => onChoose(value)}
            explanation={explain?.(value)}
          >
            {name}
          </Choice>
        ))}
      </div>
      {/* Touch screens have no hover, so the chosen answer's explanation also shows here. */}
      {explain && chosen && (
        <p className="text-muted-foreground mt-2 text-xs">
          <span className="text-foreground font-medium">{chosenName}: </span>
          {explain(chosen)}
        </p>
      )}
    </section>
  )
}

function Mark({
  right,
  label,
  said,
  was,
}: {
  right: boolean
  label: string
  said: string
  was: string
}) {
  return (
    <div className="flex items-start gap-2">
      <span
        className={cn(
          'mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full text-white',
          right ? 'bg-emerald-600' : 'bg-rose-600',
        )}
      >
        {right ? <Check className="size-3.5" /> : <X className="size-3.5" />}
        <span className="sr-only">{right ? 'Right' : 'Wrong'}</span>
      </span>
      <p className="text-sm">
        <span className="font-semibold">{label}: </span>
        {was}
        {!right && <span className="text-muted-foreground"> (you said {said})</span>}
      </p>
    </div>
  )
}

interface QuizPanelProps {
  play: Play
  level: Level
  guess: Partial<Guess>
  onGuess(guess: Partial<Guess>): void
  revealed: boolean
  peeked: boolean
  marks: Marks | null
  stats: Stats
  onSnap(): void
  onNext(): void
  /** Whether each answer explains itself. */
  explain: boolean
  onExplainChange(explain: boolean): void
}

export const QuizPanel = React.memo(function QuizPanel({
  play,
  level,
  guess,
  onGuess,
  revealed,
  peeked,
  marks,
  stats,
  onSnap,
  onNext,
  explain,
  onExplainChange,
}: QuizPanelProps) {
  const { call } = play.defense
  const ready = !!guess.coverage && !!guess.pressure
  return (
    <div className="flex flex-col gap-5">
      <div className="flex min-h-11 items-center gap-2">
        <Checkbox
          id="quiz-explain"
          checked={explain}
          onCheckedChange={(checked) => onExplainChange(!!checked)}
        />
        <Label htmlFor="quiz-explain" className="font-normal">
          Explain the answers
        </Label>
      </div>
      <Question
        id="q-coverage"
        title="What coverage will they play?"
        options={LEVELS[level].coverages.map((c) => [c, COVERAGES[c].name])}
        chosen={guess.coverage}
        locked={revealed}
        onChoose={(coverage) => onGuess({ ...guess, coverage })}
        explain={explain ? (c) => COVERAGE_GUIDE[c].short : undefined}
      />
      <Question
        id="q-pressure"
        title="Who comes after the quarterback?"
        options={LEVELS[level].pressures.map((p) => [p, PRESSURES[p].name])}
        chosen={guess.pressure}
        locked={revealed}
        onChoose={(pressure) => onGuess({ ...guess, pressure })}
        explain={explain ? (p) => PRESSURE_GUIDE[p].short : undefined}
      />

      {!revealed ? (
        <div>
          <Button className="min-h-11 w-full text-base" disabled={!ready} onClick={onSnap}>
            Snap it
          </Button>
          <p className="text-muted-foreground mt-2 text-xs">
            {ready ? 'Space bar snaps the ball.' : 'Pick a coverage and a pressure, then snap.'}
            {peeked && ' Coverage or defense names are showing, so this play will not count.'}
          </p>
        </div>
      ) : (
        <div className="bg-muted/50 flex flex-col gap-3 rounded-xl border p-4">
          <p className="font-serif text-lg font-semibold">{callName(call)}</p>
          {marks ? (
            <div className="flex flex-col gap-1.5">
              <Mark
                right={marks.coverage}
                label="Coverage"
                was={COVERAGES[call.coverage].name}
                said={guess.coverage ? COVERAGES[guess.coverage].name : ''}
              />
              <Mark
                right={marks.pressure}
                label="Rush"
                was={PRESSURES[call.pressure].name}
                said={guess.pressure ? PRESSURES[guess.pressure].name : ''}
              />
              {!marks.coverage && (marks.family || marks.shell) && (
                <p className="text-muted-foreground text-xs">
                  Close:{' '}
                  {[
                    marks.family && `you had ${COVERAGES[call.coverage].family} coverage right`,
                    marks.shell && 'you had the number of deep safeties right',
                  ]
                    .filter(Boolean)
                    .join(', and ')}
                  .
                </p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">You peeked, so this one did not count.</p>
          )}
          <p className="text-sm">
            <span className="font-semibold">After the snap: </span>
            {COVERAGE_GUIDE[call.coverage].afterSnap}
          </p>
          <CallBreakdown play={play} heading="What gave it away" />
          <Button className="min-h-11 w-full text-base" onClick={onNext}>
            Next play
          </Button>
          <p className="text-muted-foreground text-xs">N for the next play, space bar to replay.</p>
        </div>
      )}

      <YourRecord stats={stats} />
    </div>
  )
})

function TallyRows<T extends string>({
  title,
  ids,
  tallies,
  name,
}: {
  title: string
  ids: T[]
  tallies: Partial<Record<T, Tally>>
  name(id: T): string
}) {
  return (
    <>
      <tr className="text-muted-foreground text-left text-xs">
        <th className="pt-2 font-medium">{title}</th>
        <th className="pt-2 text-right font-medium">Right</th>
      </tr>
      {ids.map((id) => {
        const t = tallies[id]
        if (!t) return null
        return (
          <tr key={id}>
            <td>{name(id)}</td>
            <td className="text-right tabular-nums">
              {t.right} of {t.seen}
            </td>
          </tr>
        )
      })}
    </>
  )
}

function YourRecord({ stats }: { stats: Stats }) {
  if (stats.plays === 0) return null
  return (
    <details className="rounded-xl border p-4">
      <summary className="cursor-pointer py-3 text-sm font-semibold">
        Your record: {stats.plays} plays, streak {stats.streak}, best {stats.best}
      </summary>
      <table className="mt-1 w-full text-sm">
        <tbody>
          <TallyRows<CoverageId>
            title="Coverage"
            ids={COVERAGE_IDS}
            tallies={stats.coverage}
            name={(c) => COVERAGES[c].name}
          />
          <TallyRows<PressureId>
            title="Rush"
            ids={PRESSURE_IDS}
            tallies={stats.pressure}
            name={(p) => PRESSURES[p].name}
          />
        </tbody>
      </table>
    </details>
  )
}
