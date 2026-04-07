import * as Tone from 'tone'
import type { Lick } from './types'

const DURATION_MAP: Record<string, string> = {
  w: '1n',
  h: '2n',
  q: '4n',
  '8': '8n',
  '16': '16n',
}

function durationToSeconds(duration: string, bpm: number, dotted?: boolean): number {
  const beatsPerSecond = bpm / 60
  const durationBeats: Record<string, number> = {
    w: 4, h: 2, q: 1, '8': 0.5, '16': 0.25,
  }
  const beats = durationBeats[duration] ?? 1
  const adjustedBeats = dotted ? beats * 1.5 : beats
  return adjustedBeats / beatsPerSecond
}

export interface PlaybackCallbacks {
  /** Called on the main thread (via requestAnimationFrame) when a note starts */
  onNoteStart?: (noteIndex: number) => void
  /** Called when playback finishes */
  onFinish?: () => void
}

export class LickPlayer {
  private synth: Tone.PolySynth | null = null
  private scheduledEvents: number[] = []
  private _isPlaying = false

  get isPlaying(): boolean {
    return this._isPlaying
  }

  private ensureSynth(): Tone.PolySynth {
    if (!this.synth) {
      this.synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: {
          attack: 0.02,
          decay: 0.1,
          sustain: 0.3,
          release: 0.4,
        },
      }).toDestination()
      this.synth.volume.value = -6
    }
    return this.synth
  }

  async play(lick: Lick, callbacks?: PlaybackCallbacks): Promise<void> {
    await Tone.start()

    this.stop()
    this._isPlaying = true

    const synth = this.ensureSynth()
    const bpm = lick.tempo ?? 120
    Tone.getTransport().bpm.value = bpm

    let timeOffset = 0

    for (let i = 0; i < lick.notes.length; i++) {
      const note = lick.notes[i]
      const durationSec = durationToSeconds(note.duration, bpm, note.dotted)
      const toneDuration = DURATION_MAP[note.duration] ?? '4n'
      const noteIndex = i

      // Schedule the highlight callback for every note (including rests)
      // using Tone.Draw to sync with requestAnimationFrame
      const startTime = timeOffset
      const highlightId = Tone.getTransport().schedule((time) => {
        Tone.getDraw().schedule(() => {
          callbacks?.onNoteStart?.(noteIndex)
        }, time)
      }, startTime)
      this.scheduledEvents.push(highlightId)

      // Schedule audio for non-rest notes
      if (!note.rest) {
        const audioId = Tone.getTransport().schedule((time) => {
          synth.triggerAttackRelease(note.pitch, toneDuration, time)
        }, startTime)
        this.scheduledEvents.push(audioId)
      }

      timeOffset += durationSec
    }

    // Schedule end
    const endId = Tone.getTransport().schedule((time) => {
      Tone.getDraw().schedule(() => {
        this._isPlaying = false
        callbacks?.onNoteStart?.(-1) // clear highlight
        callbacks?.onFinish?.()
      }, time)
      Tone.getTransport().stop()
    }, timeOffset + 0.1)
    this.scheduledEvents.push(endId)

    Tone.getTransport().start()
  }

  stop(): void {
    this._isPlaying = false
    Tone.getTransport().stop()
    Tone.getTransport().cancel()
    this.scheduledEvents = []
  }

  dispose(): void {
    this.stop()
    this.synth?.dispose()
    this.synth = null
  }
}
