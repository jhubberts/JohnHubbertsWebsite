/** A single note in a lick */
export interface LickNote {
  /** Note name with octave, e.g. "C4", "Bb3", "F#5" */
  pitch: string
  /** Duration as VexFlow string: "w"=whole, "h"=half, "q"=quarter, "8"=eighth, "16"=sixteenth */
  duration: string
  /** Rest instead of a sounding note */
  rest?: boolean
  /** Dotted duration */
  dotted?: boolean
  /** Tied to the next note */
  tied?: boolean
}

/** A chord symbol placed at a beat position */
export interface ChordEvent {
  /** Chord symbol, e.g. "Dm7", "G7", "Cmaj7" */
  symbol: string
  /** Beat position within the lick (0-indexed, in quarter notes from the start) */
  beat: number
}

/** Guitar-specific fret/string assignment for a note */
export interface TabPosition {
  /** Guitar string (1 = high E, 6 = low E) */
  string: number
  /** Fret number (0 = open) */
  fret: number
}

/** Source reference for where the lick was heard */
export interface LickSource {
  url?: string
  timestamp?: number
  artist?: string
  song?: string
}

/** A musical lick with its context and metadata */
export interface Lick {
  id: string
  name: string
  description?: string

  /** Key the lick is written in, e.g. "C", "Bb", "F#" */
  key: string
  /** Time signature as [beats, beatValue], e.g. [4, 4] */
  timeSignature: [number, number]
  /** Tempo in BPM (optional) */
  tempo?: number
  /** Number of beats in the pickup (anacrusis) measure, if any.
   *  e.g. 1 means one beat of pickup before bar 1. */
  pickupBeats?: number

  /** The notes of the lick */
  notes: LickNote[]
  /** Backing chords the lick plays over */
  backingChords: ChordEvent[]

  /** Guitar tab positions (auto-generated or manual override) */
  tabPositions?: TabPosition[]

  /** Where the lick came from */
  source?: LickSource

  tags?: string[]
}
