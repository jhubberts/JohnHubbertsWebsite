import { Note as TonalNote, Interval } from 'tonal'
import type { Lick } from './types'

/** Compute the interval string for transposing from one key to another */
function transpositionInterval(fromKey: string, toKey: string): string {
  return Interval.distance(fromKey + '4', toKey + '4')
}

/** Transpose a single pitch string by an interval, e.g. ("D4", "5P") -> "A4" */
function transposePitch(pitch: string, interval: string): string {
  const result = TonalNote.transpose(pitch, interval)
  return result || pitch
}

/** Transpose a chord symbol root by an interval, preserving quality.
 *  e.g. ("Dm7", "5P") -> "Am7" */
function transposeChordSymbol(symbol: string, interval: string): string {
  const match = symbol.match(/^([A-G][#b]?)(.*)$/)
  if (!match) return symbol
  const [, root, quality] = match
  const newRoot = TonalNote.transpose(root + '4', interval)
  const parsed = TonalNote.get(newRoot)
  if (parsed.empty) return symbol
  return parsed.pc + quality
}

/** Transpose an entire lick to a new key.
 *  Clears tab positions since they're fret-specific and no longer valid. */
export function transposeLick(lick: Lick, targetKey: string): Lick {
  if (targetKey === lick.key) return lick

  const interval = transpositionInterval(lick.key, targetKey)

  const transposedNotes = lick.notes.map((note) => {
    if (note.rest) return note
    const newPitch = transposePitch(note.pitch, interval)
    return { ...note, pitch: newPitch }
  })

  const transposedChords = lick.backingChords.map((chord) => ({
    ...chord,
    symbol: transposeChordSymbol(chord.symbol, interval),
  }))

  return {
    ...lick,
    key: targetKey,
    notes: transposedNotes,
    backingChords: transposedChords,
    tabPositions: undefined,
  }
}
