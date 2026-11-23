import { useEffect, useMemo, useRef, useState } from 'react'
import { TryIt } from '@/components/ai-series/try-it'
import {
  cssColorToRgb,
  cssVar,
  useElementWidth,
  useThemeVersion,
} from '@/components/ai-series/draw-pad'
import {
  unitContributions,
  type DigitNet,
  type DigitReading,
} from '@/lib/ai-series/digits/digit-net'
import { cn } from '@/lib/utils'
import {
  cellAt,
  formatNumber,
  largestIndex,
  raiseAndLower,
  relativeStrengths,
  shownSum,
  topContributors,
} from './draw-a-digit-logic'
import {
  Answer,
  DigitPad,
  Empty,
  manifest,
  useDigitData,
  useReading,
  type Example,
} from './digit-parts'

const CHECKPOINT = manifest.checkpoints[manifest.checkpoints.length - 1]

const DRAW_HEADING = 'Draw a number from 0 to 9'

/**
 * The "raises the total" and "lowers the total" colors, a blue and an orange that stay apart for
 * color-blind readers, each with a light-theme and a dark-theme value.
 */
const COLOUR_VARIABLES =
  '[--raise:oklch(0.52_0.16_255)] [--lower:oklch(0.64_0.17_50)] dark:[--raise:oklch(0.74_0.13_245)] dark:[--lower:oklch(0.78_0.15_60)]'

const CHECKPOINTS = [CHECKPOINT]

/** The chapter's interactive: draw a digit and see how the network reads it, step by step. */
export function DrawADigit() {
  const load = useDigitData(CHECKPOINTS)

  return (
    <TryIt title="Draw a digit">
      {load.status === 'loading' && (
        <p className="text-muted-foreground text-base">
          Loading the network&rsquo;s 25,818 numbers&hellip;
        </p>
      )}
      {load.status === 'failed' && (
        <p className="text-base">
          The network&rsquo;s numbers did not load. Check your connection and reload the page.
        </p>
      )}
      {load.status === 'ready' && <DigitReader net={load.nets[0]} examples={load.examples} />}
    </TryIt>
  )
}

function DigitReader({ net, examples }: { net: DigitNet; examples: Example[] }) {
  const [input, setInput] = useState<Float32Array | null>(null)
  const reading = useReading(net, input)

  return (
    <div className={cn('space-y-8 text-base', COLOUR_VARIABLES)}>
      <div className="grid gap-8 md:grid-cols-2">
        <DigitPad heading={DRAW_HEADING} examples={examples} onInput={setInput} />

        <section>
          <h4 className="mb-3 text-xl font-semibold">The network reads</h4>
          {reading ? <Answer reading={reading} /> : <Empty />}
        </section>
      </div>

      <h4 className="border-t pt-6 text-xl font-semibold">How it got there</h4>

      <section>
        <h5 className="mb-3 text-lg font-semibold">1. Your drawing becomes 784 numbers</h5>
        {reading ? <DrawingNumbers reading={reading} /> : <Empty />}
      </section>

      <section>
        <h5 className="mb-3 text-lg font-semibold">2. Two layers of adding units</h5>
        {reading ? <HiddenLayers net={net} reading={reading} /> : <Empty />}
      </section>

      <section>
        <h5 className="mb-3 text-lg font-semibold">3. Ten totals, one for each digit</h5>
        {reading ? <DigitTotals net={net} reading={reading} /> : <Empty />}
      </section>
    </div>
  )
}

function DrawingNumbers({ reading }: { reading: DigitReading }) {
  const [cell, setCell] = useState<{ row: number; column: number } | null>(null)
  const value = cell ? reading.input[cell.row * 28 + cell.column] : 0
  return (
    <div>
      <div className="max-w-[280px]">
        <ValueGrid
          values={reading.input}
          mode="ink"
          selectedCell={cell}
          onCellTap={setCell}
          labelledBy="draw-a-digit-grid-caption"
        />
      </div>
      {cell && (
        <p className="mt-2 font-medium">
          Row {cell.row + 1}, column {cell.column + 1}: {formatNumber(value, 2)}
        </p>
      )}
      <p id="draw-a-digit-grid-caption" className="text-muted-foreground mt-2">
        Your drawing, shrunk to 28 by 28 squares and moved to the middle. Each square is a number
        from 0 (empty) to 1 (full ink).
      </p>
    </div>
  )
}

interface UnitChoice {
  layer: 1 | 2
  unit: number
}

function HiddenLayers({ net, reading }: { net: DigitNet; reading: DigitReading }) {
  const [picked, setPicked] = useState<UnitChoice | null>(null)
  const selected = picked ?? { layer: 1, unit: largestIndex(reading.hidden1) }

  return (
    <div className="space-y-4">
      <UnitRow
        label="First layer: 32 units"
        layerName="First layer"
        values={reading.hidden1}
        selectedUnit={selected.layer === 1 ? selected.unit : null}
        onSelect={(unit) => setPicked({ layer: 1, unit })}
      />
      <UnitRow
        label="Second layer: 16 units"
        layerName="Second layer"
        values={reading.hidden2}
        selectedUnit={selected.layer === 2 ? selected.unit : null}
        onSelect={(unit) => setPicked({ layer: 2, unit })}
      />
      <p className="text-muted-foreground">
        Each unit multiplies every number it receives by one of its own numbers, and adds them all
        up, along with a starting number of its own. If the total is below zero it passes on 0. A
        filled-in square means a big total. An empty square means 0.
      </p>
      <div className="bg-muted/40 rounded-lg border p-4">
        {selected.layer === 1 ? (
          <FirstLayerDetail net={net} reading={reading} unit={selected.unit} />
        ) : (
          <SecondLayerDetail net={net} reading={reading} unit={selected.unit} />
        )}
      </div>
    </div>
  )
}

function UnitRow({
  label,
  layerName,
  values,
  selectedUnit,
  onSelect,
}: {
  label: string
  layerName: string
  values: Float32Array
  selectedUnit: number | null
  onSelect(unit: number): void
}) {
  const strengths = relativeStrengths(values)
  return (
    <div>
      <p className="mb-2 font-medium">{label}</p>
      <div className="grid w-fit grid-cols-8 gap-1.5 md:grid-cols-16">
        {Array.from(values, (value, unit) => {
          const isSelected = unit === selectedUnit
          return (
            <button
              key={unit}
              type="button"
              aria-pressed={isSelected}
              aria-label={`${layerName}, unit ${unit + 1}, passes on ${formatNumber(value, 1)}${isSelected ? ', selected' : ''}`}
              onClick={() => onSelect(unit)}
              className={cn(
                'bg-card focus-visible:ring-ring/50 relative size-9 overflow-hidden rounded-md border outline-none focus-visible:ring-3',
                isSelected && 'border-primary border-4',
              )}
            >
              <span
                aria-hidden
                className="bg-foreground absolute inset-0"
                style={{ opacity: strengths[unit] }}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}

function BelowZero({ sum }: { sum: number }) {
  return sum < 0 ? <p className="mt-1">Below zero, so it passes on 0.</p> : null
}

function StartAndTotal({ bias, sum }: { bias: number; sum: number }) {
  return (
    <p className="mt-2">
      The unit starts from {formatNumber(bias, 1)}. Total: {formatNumber(sum, 1)}.
    </p>
  )
}

function FirstLayerDetail({
  net,
  reading,
  unit,
}: {
  net: DigitNet
  reading: DigitReading
  unit: number
}) {
  const { weights, contributions, bias, sum } = useMemo(
    () => unitContributions(net, reading, 1, unit),
    [net, reading, unit],
  )
  const { raise } = raiseAndLower(contributions)
  const shown = shownSum(raise, bias, sum)
  return (
    <div>
      <h6 className="mb-3 font-semibold">First layer, unit {unit + 1}</h6>
      <div className="grid max-w-[440px] grid-cols-2 gap-3">
        <div>
          <p className="mb-1 text-sm font-medium">Its own numbers</p>
          <ValueGrid values={weights} mode="signed" label="Its own numbers" />
        </div>
        <div>
          <p className="mb-1 text-sm font-medium">Where your ink meets them</p>
          <ValueGrid values={contributions} mode="signed" label="Where your ink meets them" />
        </div>
      </div>
      <Legend />
      <p className="mt-3">
        Your ink on the raising squares adds {formatNumber(shown.adds, 1)}. Your ink on the lowering
        squares takes away {formatNumber(shown.takesAway, 1)}. The unit starts from{' '}
        {formatNumber(shown.start, 1)}. Total: {formatNumber(shown.total, 1)}.
      </p>
      <BelowZero sum={sum} />
    </div>
  )
}

function Legend() {
  return (
    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
      <span className="flex items-center gap-2">
        <span aria-hidden className="size-4 rounded-sm bg-[var(--raise)]" />
        raises the total
      </span>
      <span className="flex items-center gap-2">
        <span aria-hidden className="size-4 rounded-sm bg-[var(--lower)]" />
        lowers the total
      </span>
    </div>
  )
}

function ContributorList({
  contributions,
  incomingName,
}: {
  contributions: Float32Array
  incomingName: string
}) {
  return (
    <ul className="mt-1 space-y-0.5">
      {topContributors(contributions).map(({ index, amount }) => (
        <li key={index}>
          {incomingName}, unit {index + 1}: {amount > 0 ? 'adds' : 'takes away'}{' '}
          {formatNumber(Math.abs(amount), 1)}
        </li>
      ))}
    </ul>
  )
}

function SecondLayerDetail({
  net,
  reading,
  unit,
}: {
  net: DigitNet
  reading: DigitReading
  unit: number
}) {
  const { contributions, bias, sum } = useMemo(
    () => unitContributions(net, reading, 2, unit),
    [net, reading, unit],
  )
  return (
    <div>
      <h6 className="mb-2 font-semibold">Second layer, unit {unit + 1}</h6>
      <p>It adds up the 32 units above. These pushed it most:</p>
      <ContributorList contributions={contributions} incomingName="First layer" />
      <StartAndTotal bias={bias} sum={sum} />
      <BelowZero sum={sum} />
    </div>
  )
}

function DigitTotals({ net, reading }: { net: DigitNet; reading: DigitReading }) {
  const [picked, setPicked] = useState<number | null>(null)
  const digit = picked ?? reading.answer
  const { contributions, bias, sum } = useMemo(
    () => unitContributions(net, reading, 3, digit),
    [net, reading, digit],
  )
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        The last ten units each add up the 16 units above. The biggest total wins. The totals are
        then turned into shares of 100, which are the bars at the top.
      </p>
      <div className="grid w-fit grid-cols-5 gap-2 sm:grid-cols-10">
        {Array.from({ length: 10 }, (_, d) => {
          const isSelected = d === digit
          const most = d === reading.answer
          return (
            <button
              key={d}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setPicked(d)}
              className={cn(
                'bg-card hover:bg-muted focus-visible:ring-ring/50 flex min-h-11 min-w-11 flex-col items-center justify-center rounded-lg border px-2 py-1 outline-none focus-visible:ring-3',
                isSelected && 'border-primary border-4',
              )}
            >
              <span className="text-xl font-semibold tabular-nums">{d}</span>
              {most && <span className="text-xs font-semibold">most</span>}
            </button>
          )
        })}
      </div>
      <div className="bg-muted/40 rounded-lg border p-4">
        <h6 className="mb-2 font-semibold">The total for {digit}</h6>
        <p>These pushed it most:</p>
        <ContributorList contributions={contributions} incomingName="Second layer" />
        <StartAndTotal bias={bias} sum={sum} />
      </div>
    </div>
  )
}

/**
 * A 28x28 grid of values drawn on a canvas that fills its container's width. "ink" shades each
 * square by its value (0 to 1) in the text color; "signed" shades positive values in the raise
 * color and negative ones in the lower color, by size relative to the largest.
 */
function ValueGrid({
  values,
  mode,
  selectedCell,
  onCellTap,
  labelledBy,
  label,
}: {
  values: Float32Array
  mode: 'ink' | 'signed'
  selectedCell?: { row: number; column: number } | null
  onCellTap?(cell: { row: number; column: number }): void
  labelledBy?: string
  label?: string
}) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const width = useElementWidth(wrapperRef)
  const themeVersion = useThemeVersion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || width === 0) return
    const dpr = window.devicePixelRatio || 1
    const backing = Math.round(width * dpr)
    canvas.width = backing
    canvas.height = backing
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const background = cssColorToRgb(cssVar(canvas, '--card'))
    const ink = cssColorToRgb(cssVar(canvas, '--foreground'))
    const raise = cssColorToRgb(cssVar(canvas, '--raise'))
    const lower = cssColorToRgb(cssVar(canvas, '--lower'))
    const strengths = mode === 'signed' ? relativeStrengths(values) : values

    const small = document.createElement('canvas')
    small.width = 28
    small.height = 28
    const smallCtx = small.getContext('2d')
    if (!smallCtx) return
    const image = smallCtx.createImageData(28, 28)
    for (let i = 0; i < 784; i++) {
      const s = strengths[i]
      const colour = mode === 'ink' ? ink : s >= 0 ? raise : lower
      const amount = Math.min(1, Math.abs(s))
      for (let c = 0; c < 3; c++) {
        image.data[i * 4 + c] = background[c] * (1 - amount) + colour[c] * amount
      }
      image.data[i * 4 + 3] = 255
    }
    smallCtx.putImageData(image, 0, 0)

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(small, 0, 0, width, width)
    if (selectedCell) {
      const cell = width / 28
      ctx.strokeStyle = cssVar(canvas, '--primary')
      ctx.lineWidth = 2
      ctx.strokeRect(selectedCell.column * cell, selectedCell.row * cell, cell, cell)
    }
  }, [values, mode, selectedCell, width, themeVersion])

  return (
    <div ref={wrapperRef} className="w-full">
      <canvas
        ref={canvasRef}
        role={labelledBy || label ? 'img' : undefined}
        aria-labelledby={labelledBy}
        aria-label={label}
        aria-hidden={labelledBy || label ? undefined : true}
        className={cn('ring-border block rounded-sm ring-1', onCellTap && 'cursor-pointer')}
        style={{ width: width || '100%', height: width || undefined }}
        onClick={
          onCellTap
            ? (event) => {
                const rect = event.currentTarget.getBoundingClientRect()
                onCellTap(cellAt(event.clientX - rect.left, event.clientY - rect.top, rect.width))
              }
            : undefined
        }
      />
    </div>
  )
}
