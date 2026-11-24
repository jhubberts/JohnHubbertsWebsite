import { useCallback, useEffect, useRef, useState } from 'react'

interface Playback {
  /** The frame on screen, always between 0 and `count - 1`. */
  index: number
  playing: boolean
  /** Plays from frame `from` (default: where it is) and stops at frame `to`. */
  play(to: number, from?: number): void
  pause(): void
  seek(index: number): void
}

/**
 * Steps through `count` frames of `dt` seconds each in real time, at `speed` times normal. The
 * frame index only moves forward while playing and stops at the requested frame.
 */
export function usePlayback(count: number, dt: number, speed: number): Playback {
  const [index, setIndex] = useState(0)
  const [stopAt, setStopAt] = useState<number | null>(null)
  const position = useRef(0)

  useEffect(() => {
    if (stopAt === null) return
    let last: number | null = null
    let raf = 0
    const tick = (now: number) => {
      const elapsed = last === null ? 0 : Math.min((now - last) / 1000, 0.1)
      last = now
      position.current = Math.min(position.current + (elapsed * speed) / dt, stopAt)
      setIndex(Math.round(position.current))
      if (position.current >= stopAt) {
        setStopAt(null)
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [stopAt, dt, speed])

  const seek = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(count - 1, i))
      position.current = clamped
      setIndex(clamped)
      setStopAt(null)
    },
    [count],
  )

  const play = useCallback(
    (to: number, from?: number) => {
      if (from !== undefined) {
        position.current = from
        setIndex(from)
      }
      setStopAt(Math.min(to, count - 1))
    },
    [count],
  )

  const pause = useCallback(() => setStopAt(null), [])

  // A shorter set of frames can arrive before the next play() or seek() resets the index.
  return { index: Math.min(index, count - 1), playing: stopAt !== null, play, pause, seek }
}
