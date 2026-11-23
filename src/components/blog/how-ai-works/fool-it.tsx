import { useState } from 'react'
import { TryIt } from '@/components/ai-series/try-it'
import { Answer, DigitPad, Empty, manifest, useDigitData, useReading } from './digit-parts'
import type { DigitNet } from '@/lib/ai-series/digits/digit-net'
import type { Example } from './digit-parts'

const CHECKPOINTS = [manifest.checkpoints[manifest.checkpoints.length - 1]]

const NOT_A_NUMBER_NOTE = 'A smiley face, a letter, a scribble. Anything but a number.'
const ANSWERED_ANYWAY =
  'It answered with a digit anyway. It was only ever shown digits, so a digit is the only kind of answer it has. It has no way to say “I don’t know”.'

/** Draw something that is not a digit and see the network answer with a digit anyway. */
export function FoolIt() {
  const load = useDigitData(CHECKPOINTS)

  return (
    <TryIt title="Fool it">
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
      {load.status === 'ready' && <Fooler net={load.nets[0]} examples={load.examples} />}
    </TryIt>
  )
}

function Fooler({ net, examples }: { net: DigitNet; examples: Example[] }) {
  const [input, setInput] = useState<Float32Array | null>(null)
  const reading = useReading(net, input)

  return (
    <div className="space-y-6 text-base">
      <div className="grid gap-8 md:grid-cols-2">
        <DigitPad
          heading="Draw something that is not a number"
          note={NOT_A_NUMBER_NOTE}
          examples={examples}
          onInput={setInput}
          startWithExample={false}
          showExampleButton={false}
          showSmallHint={false}
        />
        <section>
          <h4 className="mb-3 text-xl font-semibold">The network reads</h4>
          {reading ? <Answer reading={reading} /> : <Empty />}
        </section>
      </div>
      {reading && <p>{ANSWERED_ANYWAY}</p>}
    </div>
  )
}
