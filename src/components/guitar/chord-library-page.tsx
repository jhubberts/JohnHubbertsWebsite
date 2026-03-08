import { useState, useRef } from 'react'
import ChordExplorer from './chord-explorer'
import GuitarFingering from './guitar-fingering'
import { Synth, type Chord } from '@/lib/guitar'

const chordToRenderable = (chord: Chord) => {
  const annotations = ['', '', '', '', '', '']
  for (let i = 0; i < 6; i++) {
    const note = chord.notes[i]
    if (note != null) {
      annotations[i] = `(${note.name}/${chord.intervals[i]})`
    }
  }
  return {
    chord: { singles: chord.singles || [], barres: chord.barres || [] },
    annotations,
    title: chord.canonicalName,
  }
}

const ChordLibraryPage = () => {
  const [activeChord, setActiveChord] = useState<Chord | null>(null)
  const synthRef = useRef<Synth | null>(null)

  const getSynth = () => {
    if (!synthRef.current) {
      synthRef.current = new Synth({ audioContext: new AudioContext() })
    }
    return synthRef.current
  }

  const createOnClick = (chord: Chord) => {
    return () => getSynth().playChordForXSeconds(chord, 1)
  }

  const createOnMouseOverNote = (chord: Chord) => {
    return (note: { string: number }) => {
      const noteObj = chord.notes[6 - note.string]
      if (noteObj) getSynth().playNoteForXSeconds(noteObj, 1)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Chord Library</h1>
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 md:col-span-3">
          <ChordExplorer onSelection={(chord) => setActiveChord(chord)} />
        </div>
        {activeChord != null && (
          <div className="col-span-12 md:col-span-9">
            <GuitarFingering
              width={500}
              {...chordToRenderable(activeChord)}
              onMouseOverNote={createOnMouseOverNote(activeChord)}
              onClick={createOnClick(activeChord)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default ChordLibraryPage
