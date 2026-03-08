import { useRef } from 'react'
import GuitarFingering from '@/components/guitar/guitar-fingering'
import { ChordLibrary, Synth, type Chord } from '@/lib/guitar'
import { compareChords } from '@/lib/guitar/progression-solver'

const chordToRenderable = (chord: Chord) => ({
  chord: { singles: chord.singles || [], barres: chord.barres || [] },
  annotations: chord.notes.map((n) => (n == null ? '' : n.name)),
  title: chord.canonicalName,
})

function useChordAudio() {
  const synthRef = useRef<Synth | null>(null)
  const getSynth = () => {
    if (!synthRef.current) {
      synthRef.current = new Synth({ audioContext: new AudioContext() })
    }
    return synthRef.current
  }
  return {
    playChord: (chord: Chord) => () => getSynth().playChordForXSeconds(chord, 1),
    playNote: (chord: Chord) => (note: { string: number }) => {
      const noteObj = chord.notes[6 - note.string]
      if (noteObj) getSynth().playNoteForXSeconds(noteObj, 1)
    },
  }
}

function ChordRow({ chords, width = 150 }: { chords: Chord[]; width?: number }) {
  const { playChord, playNote } = useChordAudio()
  return (
    <div className="flex flex-wrap gap-4 items-center">
      {chords.map((chord, i) => (
        <div key={i}>
          <GuitarFingering
            width={width}
            {...chordToRenderable(chord)}
            onClick={playChord(chord)}
            onMouseOverNote={playNote(chord)}
          />
        </div>
      ))}
    </div>
  )
}

function ScoredChordRow({ chords, width = 150 }: { chords: Chord[]; width?: number }) {
  const { playChord, playNote } = useChordAudio()
  if (chords.length < 3) return null

  const score01 = compareChords(chords[0], chords[1])
  const score12 = compareChords(chords[1], chords[2])

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <div>
        <GuitarFingering width={width} {...chordToRenderable(chords[0])} onClick={playChord(chords[0])} onMouseOverNote={playNote(chords[0])} />
      </div>
      <span className="text-lg font-semibold">&rarr; {score01} &rarr;</span>
      <div>
        <GuitarFingering width={width} {...chordToRenderable(chords[1])} onClick={playChord(chords[1])} onMouseOverNote={playNote(chords[1])} />
      </div>
      <span className="text-lg font-semibold">&rarr; {score12} &rarr;</span>
      <div>
        <GuitarFingering width={width} {...chordToRenderable(chords[2])} onClick={playChord(chords[2])} onMouseOverNote={playNote(chords[2])} />
      </div>
      <span className="text-lg font-semibold">= {score01 + score12}</span>
    </div>
  )
}

function useExampleChords() {
  const library = ChordLibrary.standard()

  const overriddenAnnotation = library.get_by_root_name_and_label('G', '9', '5th Root')?.transpose('G')
  if (overriddenAnnotation) overriddenAnnotation.canonicalName = 'G9 (Sub G7)'

  const lowMovementChords = [
    library.get_by_root_name_and_label('D', 'min7', '6th Root #1'),
    overriddenAnnotation,
    library.get_by_root_name_and_label('C', 'maj7', '6th Root'),
  ].filter(Boolean) as Chord[]

  const highMovementChords = [
    library.get_by_root_name_and_label('D', 'min7', '6th Root #1'),
    library.get_by_root_name_and_label('G', '7', '4th Root'),
    library.get_by_root_name_and_label('C', 'maj7', '6th Root'),
  ].filter(Boolean) as Chord[]

  return { lowMovementChords, highMovementChords }
}

export function ChordExamples() {
  const { lowMovementChords, highMovementChords } = useExampleChords()
  return (
    <div className="not-prose">
      <h3 className="text-lg font-medium mt-4 mb-2">Low Movement</h3>
      <ChordRow chords={lowMovementChords} />
      <h3 className="text-lg font-medium mt-6 mb-2">High Movement</h3>
      <ChordRow chords={highMovementChords} />
    </div>
  )
}

export function ScoredChordExamples() {
  const { lowMovementChords, highMovementChords } = useExampleChords()
  return (
    <div className="not-prose">
      <h3 className="text-lg font-medium mt-4 mb-2">Low Movement (scored)</h3>
      <ScoredChordRow chords={lowMovementChords} />
      <h3 className="text-lg font-medium mt-6 mb-2">High Movement (scored)</h3>
      <ScoredChordRow chords={highMovementChords} />
    </div>
  )
}
