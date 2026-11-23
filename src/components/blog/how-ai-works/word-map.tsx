import { useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { TryIt } from '@/components/ai-series/try-it'
import { cn } from '@/lib/utils'
import {
  alphabetical,
  dotPosition,
  groupMarks,
  groupNames,
  labelPosition,
  mapLabel,
  nearestWord,
  sameGroupCount,
  startingWord,
  type MapWord,
  type Shape,
  type WordMapData,
  spreadToFill,
} from '@/lib/ai-series/language/word-map'

const INTRO =
  'Inside the model, every word is a list of 768 numbers. Words that are used in similar ways end up with similar numbers. Here are 248 words, placed so that similar ones sit near each other.'
const ROUGH_NOTE =
  'The map squashes 768 numbers down to two, so distances on it are only roughly right. The list above uses all 768.'
const FOOTER =
  'Real numbers from GPT-2, recorded for this page. Nobody told the model which words belong together. It worked that out from text.'

const MAX_WIDTH = 560
const DOT_RADIUS = 4
const LABEL_FONT = 14
const LABEL_HEIGHT = 18

/** Three colours, each with a light and a dark value, that stay apart for colour-blind readers. */
const COLOUR_STYLES = `
.word-map { --wm-c0: #1f5fa8; --wm-c1: #c25a00; --wm-c2: #4a4a4a; }
.dark .word-map { --wm-c0: #6cb2f2; --wm-c1: #ffa24d; --wm-c2: #d4d4d4; }
`

type Load = { status: 'loading' } | { status: 'failed' } | { status: 'ready'; data: WordMapData }

/** 248 words placed by the model's own numbers; tap near one to see its five nearest. */
export function WordMap() {
  const [load, setLoad] = useState<Load>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    import('@/lib/ai-series/language/word-map.json').then(
      (module) => {
        if (!cancelled) setLoad({ status: 'ready', data: module.default as WordMapData })
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
    <TryIt title="Word map">
      <div className="word-map space-y-5 text-base">
        <style>{COLOUR_STYLES}</style>
        <p>{INTRO}</p>
        {load.status === 'loading' && <p className="text-muted-foreground">Loading…</p>}
        {load.status === 'failed' && (
          <p>This did not load. Check your connection and reload the page.</p>
        )}
        {load.status === 'ready' && <Explorer words={spreadToFill(load.data.words)} />}
        <p className="text-muted-foreground text-sm">{FOOTER}</p>
      </div>
    </TryIt>
  )
}

function Explorer({ words }: { words: MapWord[] }) {
  const [selected, setSelected] = useState(() => startingWord(words))
  const [onlyGroup, setOnlyGroup] = useState<string | null>(null)
  const names = groupNames(words)
  const marks = groupMarks(names)
  const sorted = alphabetical(words)
  const byWord = new Map(words.map((w) => [w.word, w]))
  const nearest = selected.nearest.map((n) => byWord.get(n.word)).filter((w) => w !== undefined)
  const same = sameGroupCount(words, selected)

  return (
    <>
      <MapView
        words={words}
        marks={marks}
        selected={selected}
        nearest={nearest}
        onlyGroup={onlyGroup}
        onSelect={setSelected}
      />

      <div className="flex flex-col gap-1">
        <label htmlFor="word-map-pick" className="font-semibold">
          Or pick a word
        </label>
        <select
          id="word-map-pick"
          value={selected.word}
          onChange={(event) => setSelected(byWord.get(event.target.value) ?? selected)}
          className="border-input bg-background text-foreground focus-visible:ring-ring/50 focus-visible:border-ring min-h-12 w-full max-w-xs rounded-lg border px-3 text-base outline-none focus-visible:ring-3"
        >
          {sorted.map((w) => (
            <option key={w.word} value={w.word}>
              {w.word}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2" aria-live="polite">
        <p>
          Nearest to &ldquo;{selected.word}&rdquo;, using all 768 numbers:{' '}
          <strong>{selected.nearest.map((n) => n.word).join(', ')}</strong>
        </p>
        <p>
          {selected.word} is in the group &ldquo;{selected.group}&rdquo;.{' '}
          {same === 0
            ? 'None of its five nearest are in the same group.'
            : same === 1
              ? '1 of its five nearest is in the same group.'
              : `${same} of its five nearest are in the same group.`}
        </p>
      </div>
      <p className="text-muted-foreground text-sm">{ROUGH_NOTE}</p>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Groups">
        {names.map((name) => {
          const mark = marks.get(name)!
          const pressed = onlyGroup === name
          return (
            <button
              key={name}
              type="button"
              aria-pressed={pressed}
              onClick={() => setOnlyGroup(pressed ? null : name)}
              className={cn(
                'bg-background text-foreground hover:bg-muted focus-visible:ring-ring/50 focus-visible:border-ring inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-base outline-none focus-visible:ring-3',
                pressed ? 'border-primary border-2 px-[11px] font-semibold' : 'border-input',
              )}
            >
              <svg width="16" height="16" viewBox="-8 -8 16 16" aria-hidden="true">
                <Mark shape={mark.shape} r={6} fill={`var(--wm-c${mark.colour})`} />
              </svg>
              <span>
                {pressed && <span aria-hidden="true">{'✓ '}</span>}
                {name}
              </span>
            </button>
          )
        })}
        <button
          type="button"
          onClick={() => setOnlyGroup(null)}
          className="bg-background text-foreground hover:bg-muted focus-visible:ring-ring/50 focus-visible:border-ring border-input min-h-11 rounded-lg border px-3 text-base outline-none focus-visible:ring-3"
        >
          Show all
        </button>
      </div>
    </>
  )
}

function MapView({
  words,
  marks,
  selected,
  nearest,
  onlyGroup,
  onSelect,
}: {
  words: MapWord[]
  marks: ReturnType<typeof groupMarks>
  selected: MapWord
  nearest: MapWord[]
  onlyGroup: string | null
  onSelect: (word: MapWord) => void
}) {
  const ref = useRef<SVGSVGElement>(null)
  const [size, setSize] = useState(MAX_WIDTH)

  useEffect(() => {
    const svg = ref.current
    if (!svg || typeof ResizeObserver === 'undefined') return
    const measure = () => setSize(Math.max(200, Math.round(svg.getBoundingClientRect().width)))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(svg)
    return () => observer.disconnect()
  }, [])

  function onClick(event: MouseEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const found = nearestWord(
      words,
      { x: event.clientX - rect.left, y: event.clientY - rect.top },
      rect.width,
    )
    if (found) onSelect(found)
  }

  const nearestNames = new Set(nearest.map((w) => w.word))
  const selectedAt = dotPosition(selected, size)

  return (
    <svg
      ref={ref}
      role="img"
      aria-label={mapLabel(words, selected)}
      viewBox={`0 0 ${size} ${size}`}
      onClick={onClick}
      className="border-border bg-background mx-auto block aspect-square w-full cursor-pointer touch-manipulation rounded-lg border"
      style={{ maxWidth: MAX_WIDTH }}
    >
      {nearest.map((w) => {
        const at = dotPosition(w, size)
        return (
          <line
            key={w.word}
            x1={selectedAt.x}
            y1={selectedAt.y}
            x2={at.x}
            y2={at.y}
            stroke="var(--foreground)"
            strokeWidth={1}
            opacity={0.6}
          />
        )
      })}
      {words.map((w) => {
        const at = dotPosition(w, size)
        const mark = marks.get(w.group)!
        const bright = onlyGroup === null || w.group === onlyGroup
        const involved = w === selected || nearestNames.has(w.word)
        return (
          <g
            key={w.word}
            transform={`translate(${at.x} ${at.y})`}
            opacity={bright || involved ? 1 : 0.2}
          >
            <Mark shape={mark.shape} r={DOT_RADIUS} fill={`var(--wm-c${mark.colour})`} />
          </g>
        )
      })}
      {nearest.map((w) => {
        const at = dotPosition(w, size)
        return (
          <circle
            key={w.word}
            cx={at.x}
            cy={at.y}
            r={DOT_RADIUS + 3}
            fill="none"
            stroke="var(--foreground)"
            strokeWidth={1.5}
          />
        )
      })}
      <circle
        cx={selectedAt.x}
        cy={selectedAt.y}
        r={DOT_RADIUS + 6}
        fill="none"
        stroke="var(--foreground)"
        strokeWidth={3}
      />
      {/* Only the chosen word is labelled. Its nearest words sit so close together that their labels
          would cover each other; they are ringed here and named in the list under the map. */}
      <Label word={selected} size={size} bold />
    </svg>
  )
}

function Label({ word, size, bold = false }: { word: MapWord; size: number; bold?: boolean }) {
  const width = Math.ceil(word.word.length * LABEL_FONT * 0.6) + 4
  const at = labelPosition(dotPosition(word, size), width, LABEL_HEIGHT, size, DOT_RADIUS + 8)
  return (
    <text
      x={at.x + 2}
      y={at.y + LABEL_HEIGHT - 4}
      fontSize={LABEL_FONT}
      fontWeight={bold ? 700 : 500}
      fill="var(--foreground)"
      stroke="var(--card)"
      strokeWidth={4}
      strokeLinejoin="round"
      paintOrder="stroke"
      pointerEvents="none"
    >
      {word.word}
    </text>
  )
}

/** A dot of one of four shapes, centred on the origin, `r` pixels from centre to edge. */
function Mark({ shape, r, fill }: { shape: Shape; r: number; fill: string }) {
  switch (shape) {
    case 'circle':
      return <circle r={r} fill={fill} />
    case 'square':
      return <rect x={-r * 0.85} y={-r * 0.85} width={r * 1.7} height={r * 1.7} fill={fill} />
    case 'triangle':
      return (
        <polygon points={`0,${-r} ${r * 1.1},${r * 0.85} ${-r * 1.1},${r * 0.85}`} fill={fill} />
      )
    case 'diamond':
      return (
        <polygon points={`0,${-r * 1.2} ${r * 1.2},0 0,${r * 1.2} ${-r * 1.2},0`} fill={fill} />
      )
  }
}
