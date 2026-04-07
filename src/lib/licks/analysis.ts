import { Note as TonalNote, Interval, Chord, Scale, ChordType } from 'tonal'
import type { Lick, LickNote, ChordEvent } from './types'

/** Analysis of a single note's role in its harmonic context */
export interface NoteAnalysis {
  /** The note pitch, e.g. "D4" */
  pitch: string
  /** Interval from the active chord root, e.g. "1P", "3m", "5P", "7m" */
  chordInterval: string
  /** Human-friendly chord tone label, e.g. "R", "b3", "5", "b7" */
  chordToneLabel: string
  /** Scale degree relative to the key, e.g. "1", "2", "b3", "4" */
  scaleDegree: string
  /** The backing chord active during this note */
  activeChord: string
  /** Whether this note is a chord tone of the active chord */
  isChordTone: boolean
  /** Whether this note is in the key's diatonic scale */
  isDiatonic: boolean
  /** Classification of the note's role */
  role: NoteRole
}

export type NoteRole =
  | 'chord-tone'      // part of the active chord
  | 'color-tone'      // extension (9, 11, 13) — diatonic but not in the chord
  | 'approach-tone'   // chromatic half-step to a chord tone
  | 'passing-tone'    // non-chord, non-chromatic, between two other tones
  | 'scale-tone'      // in the key but not a chord tone or clear function

/** Full analysis of a lick */
export interface LickAnalysis {
  noteAnalyses: NoteAnalysis[]
  /** Chords that this lick's note set could also fit over */
  substitutionChords: string[]
  /** Summary of what makes this lick work */
  theorySummary: string[]
}

/** Map an interval string to a human-readable chord tone label */
function intervalToLabel(interval: string): string {
  const map: Record<string, string> = {
    '1P': 'R',
    '2m': 'b9',
    '2M': '9',
    '2A': '#9',
    '3m': 'b3',
    '3M': '3',
    '4P': '11',
    '4A': '#11',
    '5d': 'b5',
    '5P': '5',
    '5A': '#5',
    '6m': 'b13',
    '6M': '13',
    '7m': 'b7',
    '7M': '7',
  }
  return map[interval] ?? interval
}

/** Map an interval to a scale degree string */
function intervalToScaleDegree(interval: string): string {
  const map: Record<string, string> = {
    '1P': '1',
    '2m': 'b2',
    '2M': '2',
    '2A': '#2',
    '3m': 'b3',
    '3M': '3',
    '4P': '4',
    '4A': '#4',
    '5d': 'b5',
    '5P': '5',
    '5A': '#5',
    '6m': 'b6',
    '6M': '6',
    '7m': 'b7',
    '7M': '7',
  }
  return map[interval] ?? interval
}

/** Determine which backing chord is active at a given beat */
function getActiveChord(backingChords: ChordEvent[], beat: number): ChordEvent | null {
  let active: ChordEvent | null = null
  for (const chord of backingChords) {
    if (chord.beat <= beat) {
      if (!active || chord.beat > active.beat) {
        active = chord
      }
    }
  }
  return active
}

/** Extract the root note name from a chord symbol, e.g. "Dm7" -> "D", "Bbmaj7" -> "Bb" */
function chordRoot(symbol: string): string {
  const match = symbol.match(/^([A-G][#b]?)/)
  return match ? match[1] : 'C'
}

/** Check if a note is a half-step away from any chord tone */
function isApproachTone(
  notePc: string,
  chordNotes: string[],
  nextNotePc: string | null,
): boolean {
  if (!nextNotePc) return false
  // An approach tone is a chromatic half step that resolves to a chord tone
  for (const ct of chordNotes) {
    const dist = Math.abs(Interval.semitones(Interval.distance(notePc, ct)) ?? 99)
    if (dist === 1 && ct === nextNotePc) {
      return true
    }
  }
  return false
}

/** Classify a note's melodic role */
function classifyNote(
  notePc: string,
  chordNotes: string[],
  scaleNotes: string[],
  nextNotePc: string | null,
  chordInterval: string,
): NoteRole {
  // Is it a chord tone?
  if (chordNotes.includes(notePc)) {
    return 'chord-tone'
  }

  // Is it a diatonic extension (9, 11, 13)?
  const semis = Interval.semitones(chordInterval)
  if (semis !== undefined && scaleNotes.includes(notePc)) {
    const label = intervalToLabel(chordInterval)
    if (['9', '11', '13', 'b9', '#9', '#11', 'b13'].includes(label)) {
      return 'color-tone'
    }
  }

  // Is it a chromatic approach tone?
  if (isApproachTone(notePc, chordNotes, nextNotePc)) {
    return 'approach-tone'
  }

  // Is it diatonic?
  if (scaleNotes.includes(notePc)) {
    return 'scale-tone'
  }

  // Default: passing tone (chromatic, non-diatonic)
  return 'passing-tone'
}

/** Infer a reasonable scale for a given key (defaults to major) */
function getKeyScale(key: string): string[] {
  const major = Scale.get(key + ' major')
  if (!major.empty) return major.notes
  // Fallback
  return Scale.get('C major').notes
}

/** Analyze all notes in a lick */
export function analyzeLick(lick: Lick): LickAnalysis {
  const scaleNotes = getKeyScale(lick.key)
  const durationToBeats: Record<string, number> = {
    w: 4, h: 2, q: 1, '8': 0.5, '16': 0.25,
  }

  // First pass: compute beat positions for all notes
  const beats: number[] = []
  let currentBeat = 0
  for (const note of lick.notes) {
    beats.push(currentBeat)
    const beatCount = durationToBeats[note.duration] ?? 1
    currentBeat += note.dotted ? beatCount * 1.5 : beatCount
  }

  // Analyze each note
  const noteAnalyses: NoteAnalysis[] = lick.notes.map((note, i) => {
    if (note.rest) {
      return {
        pitch: '',
        chordInterval: '',
        chordToneLabel: '',
        scaleDegree: '',
        activeChord: '',
        isChordTone: false,
        isDiatonic: false,
        role: 'passing-tone' as NoteRole,
      }
    }

    const notePc = TonalNote.get(note.pitch).pc // pitch class without octave
    const beat = beats[i]
    const activeChordEvent = getActiveChord(lick.backingChords, beat)
    const activeChordSymbol = activeChordEvent?.symbol ?? ''
    const root = activeChordSymbol ? chordRoot(activeChordSymbol) : lick.key

    // Chord interval
    const chordInterval = Interval.distance(root, notePc)

    // Chord notes
    const chordData = Chord.get(activeChordSymbol)
    const chordNotes = chordData.empty ? [] : chordData.notes

    // Scale interval (relative to key)
    const keyInterval = Interval.distance(lick.key, notePc)

    // Next note pitch class (for approach tone detection)
    const nextNotePc = i < lick.notes.length - 1 && !lick.notes[i + 1].rest
      ? TonalNote.get(lick.notes[i + 1].pitch).pc
      : null

    const isChordTone = chordNotes.includes(notePc)
    const isDiatonic = scaleNotes.includes(notePc)

    const role = classifyNote(notePc, chordNotes, scaleNotes, nextNotePc, chordInterval)

    return {
      pitch: note.pitch,
      chordInterval,
      chordToneLabel: intervalToLabel(chordInterval),
      scaleDegree: intervalToScaleDegree(keyInterval),
      activeChord: activeChordSymbol,
      isChordTone,
      isDiatonic,
      role,
    }
  })

  // Chord substitution analysis
  const uniquePitchClasses = [
    ...new Set(
      lick.notes
        .filter((n) => !n.rest)
        .map((n) => TonalNote.get(n.pitch).pc),
    ),
  ]
  const detectedChords = Chord.detect(uniquePitchClasses)
  // Also find chords that contain a subset of the notes
  const substitutionChords = detectedChords.filter(
    (c) => !lick.backingChords.some((bc) => bc.symbol === c),
  )

  // Generate theory summary
  const theorySummary = generateTheorySummary(noteAnalyses, lick)

  return { noteAnalyses, substitutionChords, theorySummary }
}

/** Generate human-readable theory observations about the lick */
function generateTheorySummary(analyses: NoteAnalysis[], lick: Lick): string[] {
  const summary: string[] = []
  const nonRestAnalyses = analyses.filter((a) => a.pitch)

  // Count chord tones vs non-chord tones
  const chordTones = nonRestAnalyses.filter((a) => a.role === 'chord-tone')
  const colorTones = nonRestAnalyses.filter((a) => a.role === 'color-tone')
  const approachTones = nonRestAnalyses.filter((a) => a.role === 'approach-tone')
  const passingTones = nonRestAnalyses.filter((a) => a.role === 'passing-tone')

  const pct = Math.round((chordTones.length / nonRestAnalyses.length) * 100)
  summary.push(
    `${chordTones.length} of ${nonRestAnalyses.length} notes (${pct}%) are chord tones.`,
  )

  // Check if chord tones land on strong beats
  const strongBeatChordTones = nonRestAnalyses.filter(
    (a, i) => a.role === 'chord-tone' && i % 2 === 0,
  )
  if (strongBeatChordTones.length > 0 && nonRestAnalyses.length >= 4) {
    const strongPct = Math.round(
      (strongBeatChordTones.length / Math.ceil(nonRestAnalyses.length / 2)) * 100,
    )
    if (strongPct >= 50) {
      summary.push(
        `Chord tones land on strong beats ${strongPct}% of the time — strong voice leading.`,
      )
    }
  }

  if (colorTones.length > 0) {
    const labels = [...new Set(colorTones.map((a) => a.chordToneLabel))]
    summary.push(
      `Uses color tones: ${labels.join(', ')} — these add richness without clashing.`,
    )
  }

  if (approachTones.length > 0) {
    summary.push(
      `${approachTones.length} chromatic approach tone${approachTones.length > 1 ? 's' : ''} — ` +
        'half-step resolution into chord tones creates tension and release.',
    )
  }

  if (passingTones.length > 0) {
    const labels = [...new Set(passingTones.map((a) => a.chordToneLabel))]
    summary.push(
      `Chromatic passing tone${passingTones.length > 1 ? 's' : ''} (${labels.join(', ')}) add bebop flavor.`,
    )
  }

  // Check for arpeggio patterns (3+ consecutive chord tones)
  let maxConsecutive = 0
  let current = 0
  for (const a of nonRestAnalyses) {
    if (a.role === 'chord-tone') {
      current++
      maxConsecutive = Math.max(maxConsecutive, current)
    } else {
      current = 0
    }
  }
  if (maxConsecutive >= 3) {
    summary.push(
      `Contains an arpeggio run (${maxConsecutive} consecutive chord tones) — clearly outlines the harmony.`,
    )
  }

  return summary
}
