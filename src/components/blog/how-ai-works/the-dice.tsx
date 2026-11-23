import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { TryIt } from '@/components/ai-series/try-it'
import { STOP_NAMES, leftOutCount, samplesFor, type DiceData } from '@/lib/ai-series/language/dice'
import { StartPicker } from './you-be-the-autocomplete'

const LOAD_FAILED = 'This did not load. Check your connection and reload the page.'

type Load = { status: 'loading' } | { status: 'failed' } | { status: 'ready'; data: DiceData }

function useDice(): Load {
  const [load, setLoad] = useState<Load>({ status: 'loading' })
  useEffect(() => {
    let cancelled = false
    import('@/lib/ai-series/language/dice.json').then(
      (module) => {
        if (!cancelled) setLoad({ status: 'ready', data: module.default as DiceData })
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

/** Recorded continuations of one starting text at five settings, from the top word to long shots. */
export function TheDice() {
  const load = useDice()
  return (
    <TryIt title="The dice">
      <p className="mb-6 text-base">
        The model does not always take its top word. One setting decides how often it takes a less
        likely one. Move it and watch what happens to the writing.
      </p>
      {load.status === 'loading' && <p className="text-muted-foreground text-base">Loading…</p>}
      {load.status === 'failed' && <p className="text-base">{LOAD_FAILED}</p>}
      {load.status === 'ready' && <Dice data={load.data} />}
    </TryIt>
  )
}

function Dice({ data }: { data: DiceData }) {
  const [startIndex, setStartIndex] = useState(0)
  const [stop, setStop] = useState(0)
  const [roll, setRoll] = useState(0)

  const start = data.starts[startIndex]
  const lastStop = start.settings.length - 1
  const setting = start.settings[stop]
  const samples = samplesFor(start, stop)
  const left = leftOutCount(data, start, stop)
  const sample = samples.length > 0 ? samples[roll % samples.length] : undefined
  const stopName = STOP_NAMES[stop] ?? ''
  const leftOutTotal = data.leftOut.length

  function moveTo(next: number) {
    setStop(next)
    setRoll(0)
  }

  return (
    <div className="space-y-6 text-base">
      <StartPicker
        idPrefix="dice"
        starts={data.starts.map((s) => s.text)}
        chosen={startIndex}
        onChoose={(index) => {
          setStartIndex(index)
          setRoll(0)
        }}
      />

      <section className="space-y-3">
        <label htmlFor="dice-slider" className="block text-lg font-semibold">
          How adventurous
        </label>
        <input
          id="dice-slider"
          type="range"
          min={0}
          max={lastStop}
          step={1}
          value={stop}
          aria-valuetext={stopName}
          onChange={(event) => moveTo(Number(event.target.value))}
          className="accent-primary block h-11 w-full cursor-pointer"
        />
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="h-11 flex-1 px-3 text-base"
            disabled={stop === 0}
            onClick={() => moveTo(stop - 1)}
          >
            Less adventurous
          </Button>
          <Button
            variant="outline"
            className="h-11 flex-1 px-3 text-base"
            disabled={stop === lastStop}
            onClick={() => moveTo(stop + 1)}
          >
            More adventurous
          </Button>
        </div>
        <p className="font-medium">{stopName}</p>
      </section>

      <section className="space-y-3">
        {sample ? (
          <p className="border-input bg-background rounded-lg border p-4 text-lg break-words whitespace-pre-wrap">
            <span className="text-muted-foreground">{start.text}</span>
            {sample.text}
          </p>
        ) : (
          <p>Nothing recorded at this setting is shown for this start.</p>
        )}
        {setting?.greedy && samples.length === 1 && (
          <p>At this setting the result is the same every time.</p>
        )}
        {samples.length > 1 && (
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-medium">
              Roll {(roll % samples.length) + 1} of {samples.length}
            </p>
            <Button
              variant="outline"
              className="h-11 px-5 text-base"
              onClick={() => setRoll((roll + 1) % samples.length)}
            >
              Roll again
            </Button>
          </div>
        )}
        {left > 0 && (
          <p className="text-muted-foreground text-sm">
            {left} more recorded at this setting {left === 1 ? 'is' : 'are'} not shown.
          </p>
        )}
      </section>

      <p className="text-muted-foreground text-sm">
        We recorded {data.recorded} continuations and show {data.shown}. The other {leftOutTotal}{' '}
        were left out because they were sexual, violent or crude, could give offense, named a person
        who may be real, or contained a web address. The model learned from text on the internet,
        and this is part of what it learned.
      </p>

      <p className="text-muted-foreground text-sm">
        Real outputs of GPT-2, recorded for this page. Each one is 20 pieces long, which is why they
        stop mid-sentence.
      </p>
    </div>
  )
}
