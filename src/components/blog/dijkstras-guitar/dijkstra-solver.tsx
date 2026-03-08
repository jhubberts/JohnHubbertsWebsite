import { useState, useRef } from 'react'
import GuitarFingering from '@/components/guitar/guitar-fingering'
import { ChordLibrary, ProgressionSolver, Synth, type Chord } from '@/lib/guitar'
import ChordExplorer from '@/components/guitar/chord-explorer'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

const chordToRenderable = (chord: Chord) => ({
  chord: { singles: chord.singles || [], barres: chord.barres || [] },
  annotations: chord.notes.map((n) => (n == null ? '' : n.name)),
  title: chord.canonicalName,
})

export function DijkstraSolver() {
  const [withSubstitutions, setWithSubstitutions] = useState(false)
  const [addOnEnter, setAddOnEnter] = useState(false)
  const [allowInversions, setAllowInversions] = useState(false)
  const [previewChord, setPreviewChord] = useState<Chord | null>(null)
  const [chordNames, setChordNames] = useState<string[]>([])
  const synthRef = useRef<Synth | null>(null)

  const getSynth = () => {
    if (!synthRef.current) {
      synthRef.current = new Synth({ audioContext: new AudioContext() })
    }
    return synthRef.current
  }

  const createOnClick = (chord: Chord) => () => getSynth().playChordForXSeconds(chord, 1)
  const createOnMouseOverNote = (chord: Chord) => (note: { string: number }) => {
    const noteObj = chord.notes[6 - note.string]
    if (noteObj) getSynth().playNoteForXSeconds(noteObj, 1)
  }

  const addSelected = () => {
    if (previewChord != null) setChordNames([...chordNames, previewChord.canonicalName])
  }

  const clearChords = () => setChordNames([])

  const giantSteps = () => {
    setWithSubstitutions(false)
    setChordNames([
      'Bmaj7', 'D7', 'Gmaj7', 'Bb7', 'Ebmaj7', 'Amin7', 'D7',
      'Gmaj7', 'Bb7', 'Ebmaj7', 'F#7', 'Bmaj7', 'Fmin7', 'Bb7',
      'Ebmaj7', 'Amin7', 'D7', 'Gmaj7', 'C#min7', 'F#7', 'Bmaj7',
      'Fmin7', 'Bb7', 'Ebmaj7', 'C#min7', 'F#7',
    ])
  }

  const constraintFn = allowInversions ? () => true : (chord: Chord) => chord.inversion === 0
  const result = new ProgressionSolver({ constraintFn }).solve(chordNames, withSubstitutions)
  const chords = result.chords
  const score = result.score

  const chordToFingering = (chord: Chord, width = 280) => (
    <GuitarFingering
      width={width}
      {...chordToRenderable(chord)}
      onClick={createOnClick(chord)}
      onMouseOverNote={createOnMouseOverNote(chord)}
    />
  )

  return (
    <div className="not-prose">
      {/* Controls and Preview */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-4">
          <h2 className="text-xl font-semibold mb-4">Chord Selection and Controls</h2>
          <div className="flex flex-col gap-3">
            <ChordExplorer
              onSelection={(chord) => {
                setPreviewChord(chord)
                if (addOnEnter) addSelected()
              }}
            />
            <div className="flex items-center gap-2">
              <Checkbox
                id="subs"
                checked={withSubstitutions}
                onCheckedChange={(checked) => setWithSubstitutions(!!checked)}
              />
              <Label htmlFor="subs" className="text-sm">Allow Equivalent Chord Substitutions</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="inversions"
                checked={allowInversions}
                onCheckedChange={(checked) => setAllowInversions(!!checked)}
              />
              <Label htmlFor="inversions" className="text-sm">Allow Chord Inversions</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="auto-add"
                checked={addOnEnter}
                onCheckedChange={(checked) => setAddOnEnter(!!checked)}
              />
              <Label htmlFor="auto-add" className="text-sm">Auto Add Chords on Enter Key</Label>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={addSelected}>Add Chord</Button>
              <Button variant="secondary" onClick={clearChords}>Clear Chords</Button>
              <Button variant="secondary" onClick={giantSteps}>Giant Steps Changes, Make My CPU Cry</Button>
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-8">
          <h2 className="text-xl font-semibold mb-4">Chord Preview</h2>
          {previewChord != null && chordToFingering(previewChord)}
        </div>
      </div>

      <Separator className="my-6" />

      {/* Solution */}
      <h2 className="text-xl font-semibold mb-4">
        Solution{chords.length > 0 ? ` (${score} points)` : ''}
      </h2>
      <div className="flex flex-wrap gap-2">
        {chords.map((chord, i) => (
          <div key={i}>{chordToFingering(chord, 280)}</div>
        ))}
      </div>
    </div>
  )
}
