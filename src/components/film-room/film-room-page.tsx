import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Pause, Play as PlayIcon, RotateCcw, SkipForward } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FieldView, type Overlays } from '@/components/film-room/field-view'
import { GlossarySection } from '@/components/film-room/glossary-section'
import { QuizPanel } from '@/components/film-room/quiz-panel'
import { StudyPanel, type StudyChoices } from '@/components/film-room/study-panel'
import { PACKAGES, callName, type CoverageId } from '@/lib/film-room/defense'
import {
  loadStats,
  mark,
  record,
  saveStats,
  type Guess,
  type Marks,
  type Stats,
} from '@/lib/film-room/grading'
import { FORMATIONS, MOTION_NAMES, formationName } from '@/lib/film-room/offense'
import {
  LEVELS,
  LEVEL_IDS,
  generatePlay,
  situationText,
  type Level,
  type PlayRequest,
} from '@/lib/film-room/play'
import { newSeed } from '@/lib/film-room/random'
import { CONCEPTS } from '@/lib/film-room/routes'
import { simulate } from '@/lib/film-room/simulate'
import { SITE_PAGES } from '@/lib/site-pages'
import { useDocumentTitle } from '@/lib/use-document-title'
import { useMediaQuery } from '@/lib/use-media-query'
import { usePlayback } from '@/lib/use-playback'
import { cn } from '@/lib/utils'

type Mode = 'quiz' | 'study'

const OVERLAY_NAMES: [keyof Overlays, string][] = [
  ['routes', 'Routes'],
  ['coverage', 'Coverage'],
  ['offenseNames', 'Offense names'],
  ['defenseNames', 'Defense names'],
]
const ALL_ON: Overlays = { routes: true, coverage: true, offenseNames: true, defenseNames: true }
/** Layers that give the defense's call away before the snap. */
const ANSWER_LAYERS: (keyof Overlays)[] = ['coverage', 'defenseNames']

function parseLevel(value: string | null): Level {
  return LEVEL_IDS.includes(value as Level) ? (value as Level) : 'starter'
}

function parseSeed(value: string | null): number | null {
  const n = Number(value)
  return value && Number.isInteger(n) && n >= 0 ? n : null
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: [T, string][]
  onChange(value: T): void
}) {
  return (
    <div role="group" aria-label={label} className="bg-muted inline-flex rounded-lg p-1">
      {options.map(([v, name]) => (
        <button
          key={v}
          type="button"
          aria-pressed={value === v}
          onClick={() => onChange(v)}
          className={cn(
            'min-h-11 rounded-md px-3 text-sm font-medium transition-colors',
            value === v ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {name}
        </button>
      ))}
    </div>
  )
}

export default function FilmRoomPage() {
  useDocumentTitle(SITE_PAGES.filmRoom.title)
  const [params] = useSearchParams()
  const [mode, setMode] = useState<Mode>(params.get('mode') === 'study' ? 'study' : 'quiz')
  const [level, setLevel] = useState<Level>(() => parseLevel(params.get('level')))
  const [seed, setSeed] = useState(() => parseSeed(params.get('play')) ?? newSeed())
  const [choices, setChoices] = useState<StudyChoices>({})
  const [overlays, setOverlays] = useState<Overlays>({
    routes: false,
    coverage: false,
    offenseNames: true,
    defenseNames: false,
  })
  const [guess, setGuess] = useState<Partial<Guess>>({})
  const [revealed, setRevealed] = useState(false)
  const [peeked, setPeeked] = useState(false)
  const [stats, setStats] = useState<Stats>(loadStats)
  const [slow, setSlow] = useState(false)
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  const play = useMemo(() => {
    const request: PlayRequest =
      mode === 'study' ? { level: 'pro', disguise: false, ...choices } : { level }
    return generatePlay(seed, request)
  }, [seed, mode, level, choices])
  const timeline = useMemo(() => simulate(play), [play])
  const last = timeline.frames.length - 1
  // Before the reveal a quiz play stops at the snap; otherwise it runs to the end.
  const end = mode === 'quiz' && !revealed ? timeline.snap : last
  const {
    index,
    playing,
    play: run,
    pause,
    seek,
  } = usePlayback(timeline.frames.length, timeline.dt, slow ? 0.5 : 1)
  const marks = useMemo<Marks | null>(
    () =>
      revealed && !peeked && guess.coverage && guess.pressure ? mark(play, guess as Guess) : null,
    [revealed, peeked, guess, play],
  )

  // Keep the play in the address so it can be reopened or sent. This writes the address
  // directly: a router navigation would scroll the page back to the top on every new play.
  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.set('play', String(seed))
    url.searchParams.set('level', level)
    if (mode === 'study') url.searchParams.set('mode', 'study')
    else url.searchParams.delete('mode')
    window.history.replaceState(window.history.state, '', url)
  }, [seed, level, mode])

  // A new play starts with no guess. A quiz plays the motion and stops at the snap; a study
  // example plays all the way through with every layer showing.
  useEffect(() => {
    setGuess({})
    setRevealed(false)
    setPeeked(false)
    if (mode === 'quiz') setOverlays((o) => ({ ...o, coverage: false, defenseNames: false }))
    else setOverlays(ALL_ON)
    const stop = mode === 'quiz' ? timeline.snap : last
    if (reducedMotion) seek(stop)
    else run(stop, 0)
    // Runs once per play; the other values are read as they are at that moment.
  }, [timeline])

  const toggleOverlay = (key: keyof Overlays) => {
    const turningOn = !overlays[key]
    setOverlays({ ...overlays, [key]: turningOn })
    if (mode === 'quiz' && !revealed && turningOn && ANSWER_LAYERS.includes(key)) setPeeked(true)
  }

  const snapBall = useCallback(() => {
    if (!guess.coverage || !guess.pressure) return
    if (!peeked) {
      const updated = record(stats, play, mark(play, guess as Guess))
      setStats(updated)
      saveStats(updated)
    }
    setRevealed(true)
    setOverlays((o) => ({ ...o, routes: true, coverage: true, defenseNames: true }))
    run(last, timeline.snap)
  }, [guess, peeked, play, stats, run, last, timeline.snap])

  const nextPlay = useCallback(() => setSeed(newSeed()), [])
  const replay = useCallback(() => run(end, 0), [run, end])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as Element
      if (
        // Answer buttons pass the space bar through, so it snaps right after a choice.
        target.closest('input, select, textarea, a, summary, button:not([data-answer])') ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey
      )
        return
      if (e.key === 'n' || e.key === 'N') {
        if (mode === 'study' || revealed) nextPlay()
      } else if (e.key === ' ') {
        e.preventDefault()
        if (mode === 'quiz' && !revealed) snapBall()
        else replay()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mode, revealed, nextPlay, snapBall, replay])

  const studyCoverage = useCallback(
    (coverage: CoverageId) => {
      setMode('study')
      setChoices({ coverage })
      setSeed(newSeed())
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' })
    },
    [reducedMotion],
  )

  const t = timeline.frames[index].t
  const { call } = play.defense
  const offenseText = [
    formationName(play.formation),
    `${FORMATIONS[play.formation.id].personnel} personnel`,
    play.motion ? MOTION_NAMES[play.motion.id] : null,
    CONCEPTS[play.concept].name,
  ]
    .filter(Boolean)
    .join(' · ')
  const defenseText = `${PACKAGES[call.package].name} · ${callName(call)}`
  const fieldTitle = `${situationText(play.situation)}. ${overlays.offenseNames ? offenseText : 'Offense'} against ${overlays.defenseNames ? defenseText : 'the defense'}.`

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-8 pb-16 sm:px-6 md:pt-12">
      <h1 className="page-title">Film Room</h1>
      <p className="text-muted-foreground mt-3 max-w-2xl text-lg">
        Read the defense before the snap: call the coverage and who is coming. Then snap it and
        watch what they really played. The plays are made up, drawn to NFL coverage rules, with each
        coverage coming up about as often as it does in the league.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Segmented<Mode>
          label="Mode"
          value={mode}
          options={[
            ['quiz', 'Quiz'],
            ['study', 'Study'],
          ]}
          onChange={(m) => {
            setMode(m)
            setSeed(newSeed())
          }}
        />
        {mode === 'quiz' && (
          <Segmented<Level>
            label="Level"
            value={level}
            options={LEVEL_IDS.map((l) => [l, LEVELS[l].name])}
            onChange={(l) => {
              setLevel(l)
              setSeed(newSeed())
            }}
          />
        )}
      </div>
      <p className="text-muted-foreground mt-2 text-sm">
        {mode === 'quiz'
          ? LEVELS[level].about
          : 'Pick a coverage, a rush or a concept and see as many examples as you like.'}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0">
          <div className="mb-2 flex flex-col gap-0.5 text-sm">
            <p className="font-semibold">{situationText(play.situation)}</p>
            <p>
              <span className="text-muted-foreground">Offense: </span>
              {overlays.offenseNames ? (
                offenseText
              ) : (
                <span className="text-muted-foreground italic">hidden</span>
              )}
            </p>
            <p>
              <span className="text-muted-foreground">Defense: </span>
              {overlays.defenseNames ? (
                defenseText
              ) : (
                <span className="text-muted-foreground italic">hidden</span>
              )}
            </p>
          </div>
          <FieldView
            play={play}
            timeline={timeline}
            index={index}
            overlays={overlays}
            title={fieldTitle}
          />

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button variant="outline" className="min-h-11" onClick={replay}>
              <RotateCcw /> Replay
            </Button>
            <Button
              variant="outline"
              className="min-h-11"
              aria-label={playing ? 'Pause' : 'Play'}
              onClick={() => (playing ? pause() : run(end))}
            >
              {playing ? <Pause /> : <PlayIcon />}
            </Button>
            {mode === 'quiz' && !revealed && play.motion && (
              <Button variant="outline" className="min-h-11" onClick={() => seek(timeline.snap)}>
                <SkipForward /> To the snap
              </Button>
            )}
            <label className="flex min-h-11 min-w-40 flex-1 items-center gap-2 text-sm">
              <span className="text-muted-foreground w-16 tabular-nums">
                {t < -0.01 ? 'Pre-snap' : t < 0.05 ? 'Snap' : `+${t.toFixed(1)}s`}
              </span>
              <input
                type="range"
                aria-label="Time in the play"
                className="accent-primary flex-1"
                min={0}
                max={end}
                value={Math.min(index, end)}
                onChange={(e) => seek(Number(e.target.value))}
              />
            </label>
            <Button
              variant="outline"
              className="min-h-11"
              aria-pressed={slow}
              onClick={() => setSlow(!slow)}
            >
              {slow ? '½×' : '1×'}
            </Button>
          </div>

          <div role="group" aria-label="Show on the field" className="mt-3 flex flex-wrap gap-2">
            {OVERLAY_NAMES.map(([key, name]) => (
              <button
                key={key}
                type="button"
                aria-pressed={overlays[key]}
                onClick={() => toggleOverlay(key)}
                className={cn(
                  'inline-flex min-h-11 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors',
                  overlays[key]
                    ? 'border-primary bg-accent'
                    : 'text-muted-foreground hover:bg-muted',
                )}
              >
                {overlays[key] ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                {name}
              </button>
            ))}
          </div>
        </div>

        <aside>
          {mode === 'quiz' ? (
            <QuizPanel
              play={play}
              level={level}
              guess={guess}
              onGuess={setGuess}
              revealed={revealed}
              peeked={peeked}
              marks={marks}
              stats={stats}
              onSnap={snapBall}
              onNext={nextPlay}
            />
          ) : (
            <StudyPanel
              play={play}
              choices={choices}
              onChoices={(c) => {
                setChoices(c)
                setSeed(newSeed())
              }}
              onShuffle={nextPlay}
            />
          )}
        </aside>
      </div>

      <GlossarySection onStudy={studyCoverage} />
    </div>
  )
}
