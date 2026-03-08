import { useRef } from 'react'
import { ProgressionSolver, Synth, type Chord } from '@/lib/guitar'
import GuitarFingering from './guitar-fingering'

const chordToRenderable = (chord: Chord) => ({
  chord: { singles: chord.singles || [], barres: chord.barres || [] },
  annotations: chord.notes.map((n) => (n == null ? '' : n.name)),
  title: chord.canonicalName,
})

const FretboardTestPage = () => {
  const synthRef = useRef<Synth | null>(null)

  const getSynth = () => {
    if (!synthRef.current) {
      synthRef.current = new Synth({ audioContext: new AudioContext() })
    }
    return synthRef.current
  }

  const progression = ['Bmaj7']
  const result = new ProgressionSolver().solve(progression)
  const chords = result.chords

  const fingeringCharts = chords.map((chord, i) => (
    <GuitarFingering
      key={i}
      width={280}
      {...chordToRenderable(chord)}
      onClick={() => getSynth().playChordForXSeconds(chord, 1)}
    />
  ))

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Fretboard Test</h1>
      <div className="flex flex-wrap gap-4">{fingeringCharts}</div>
    </div>
  )
}

export default FretboardTestPage
