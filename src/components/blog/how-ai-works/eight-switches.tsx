import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { TryIt } from '@/components/ai-series/try-it'
import { HandwrittenNumber } from '@/components/blog/handwritten-digit'
import {
  WORTHS,
  bitsToNumber,
  letterWords,
  numberToBits,
  sumWords,
} from '@/lib/ai-series/program/binary'
import { cn } from '@/lib/utils'

/** Chapter 2's row of eight switches that together hold a number from 0 to 255. */
export function EightSwitches() {
  const [bits, setBits] = useState(() => numberToBits(0))
  const [announcement, setAnnouncement] = useState('')
  const value = bitsToNumber(bits)

  function show(next: boolean[]) {
    setBits(next)
    const nextValue = bitsToNumber(next)
    setAnnouncement(`${nextValue}. ${letterWords(nextValue)}`)
  }

  return (
    <TryIt title="Eight switches">
      <div className="space-y-6 text-base">
        <p>Each switch is either off or on. Tap them to make a number.</p>
        <div className="grid grid-cols-8 gap-1.5 sm:gap-3">
          {WORTHS.map((worth, i) => (
            <Switch
              key={worth}
              worth={worth}
              on={bits[i]}
              onToggle={() => show(bits.map((bit, j) => (j === i ? !bit : bit)))}
            />
          ))}
        </div>
        <div className="flex flex-col items-center gap-2">
          <HandwrittenNumber value={value} className="h-24 max-w-full" />
          <p className="sr-only">{value}</p>
          <p className="text-center font-mono text-lg">{sumWords(bits)}</p>
        </div>
        <div>
          <p className="text-lg font-semibold">{letterWords(value)}</p>
          <p className="text-muted-foreground mt-1">
            Computers store letters as numbers too. In the standard code, 65 means A.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            className="h-12 px-5 text-base sm:flex-1"
            onClick={() => show(numberToBits(0))}
          >
            All off
          </Button>
          <Button
            variant="outline"
            className="h-12 px-5 text-base sm:flex-1"
            onClick={() => show(numberToBits(65))}
          >
            Make 65
          </Button>
          <Button
            variant="outline"
            className="h-12 px-5 text-base sm:flex-1"
            onClick={() => show(numberToBits(255))}
          >
            All on
          </Button>
        </div>
        <p className="text-muted-foreground">
          Eight switches can make every whole number from 0 to 255.
        </p>
        <p role="status" className="sr-only">
          {announcement}
        </p>
      </div>
    </TryIt>
  )
}

/**
 * One switch: a tall toggle whose knob sits at the top and is filled when on, at the bottom and
 * hollow when off, with `on` or `off` written in it and its worth under it. Its accessible name is
 * its worth; whether it is on is told by `aria-checked`.
 */
function Switch({ worth, on, onToggle }: { worth: number; on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className="group focus-visible:ring-ring/50 flex min-w-9 flex-col items-center gap-1.5 rounded-lg outline-none focus-visible:ring-3"
    >
      <span
        aria-hidden="true"
        className={cn(
          'flex h-16 w-full max-w-12 flex-col items-center rounded-full border-2 p-1',
          on ? 'border-primary bg-accent justify-start' : 'border-input bg-muted justify-end',
        )}
      >
        <span
          className={cn(
            'flex aspect-square w-full items-center justify-center rounded-full text-xs font-semibold',
            on
              ? 'bg-primary text-primary-foreground'
              : 'bg-background text-muted-foreground border-input border',
          )}
        >
          {on ? 'on' : 'off'}
        </span>
      </span>
      <span className="text-sm font-medium tabular-nums">{worth}</span>
    </button>
  )
}
