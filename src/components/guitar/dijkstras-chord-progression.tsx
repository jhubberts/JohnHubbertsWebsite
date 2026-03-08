import { useState, useRef } from 'react'
import GuitarFingering from './guitar-fingering'
import { ChordLibrary, ProgressionSolver, Synth, type Chord } from '@/lib/guitar'
import { compareChords } from '@/lib/guitar/progression-solver'
import ChordExplorer from './chord-explorer'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

const chordToRenderable = (chord: Chord) => ({
  chord: { singles: chord.singles || [], barres: chord.barres || [] },
  annotations: chord.notes.map((n) => (n == null ? '' : n.name)),
  title: chord.canonicalName,
})

const DijkstrasChordProgression = () => {
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

  const library = ChordLibrary.standard()

  // Example chords for the blurb
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

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Blurb */}
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold mb-4">Dijkstra's Chord Progression</h1>
        <h2 className="text-xl font-semibold mt-6 mb-2">Background</h2>
        <p className="mb-4 text-muted-foreground">
          I've been learning jazz guitar concepts recently, and I wanted to build some intuition around selecting
          chord voicings while comping (or playing chords to complement the bass and melody). For those unfamiliar
          with the space here's the general problem; in a given song I'll be provided chord changes that look
          something like "Dmin7 -&gt; G7 -&gt; Cmaj7". Each chord can be played a lot of different ways; for example
          a Cmaj7 requires me to hit C/E/G/B, but I can play in different octaves, I can play the notes in any order
          (play E/G/B/C or even G/C/E/B), or play them on different places on the guitar neck or piano.
          Each specific way to play a chord is referred to as a voicing.
        </p>
        <p className="mb-4 text-muted-foreground">
          Some combinations of chord voicings are easier to play than others. For the example of the "Dmin7 -&gt;
          G7 -&gt; Cmaj7" there is a combination of them that keeps all of my fingers between the 8th and 10th frets,
          and there are many more combinations that require moving all along the guitar neck. For example:
        </p>

        <h3 className="text-lg font-medium mt-4 mb-2">Low Movement</h3>
        <div className="flex flex-wrap gap-4 items-center mb-4">
          {lowMovementChords.map((chord, i) => (
            <div key={i}>{chordToFingering(chord, 150)}</div>
          ))}
        </div>

        <h3 className="text-lg font-medium mt-4 mb-2">High Movement</h3>
        <div className="flex flex-wrap gap-4 items-center mb-4">
          {highMovementChords.map((chord, i) => (
            <div key={i}>{chordToFingering(chord, 150)}</div>
          ))}
        </div>

        <p className="mb-4 text-muted-foreground">
          I wanted to figure out the lowest movement way to play a given chord progression, so I turned to some
          computer science. I implemented a scoring heuristic to compare the "distance" between two chord voicings.
          In this case it adds 1 point for every fret I need to move on each finger, it adds 2 points for every
          string I need to move over on each finger, and it adds bonus points if I have to move to or from a barre
          position (where one finger is holding down multiple strings).
        </p>
        <p className="mb-4 text-muted-foreground">
          I then created a Directed Acyclic Graph of all voicings in the chord progression I'm trying to solve.
          Once I've built the graph, I use Dijkstra's algorithm, a well known algorithm for finding the shortest
          path in a DAG system, to find the combination of voicings with the lowest total movement score.
          To make matters more confusing, you can sometimes substitute chords for other chords (for example a
          G9 is a drop-in for a G7 because it's just a G7 + play the 9th note from G also), so I modified
          the solver to take a parameter that determines whether or not to use substitutions. Here's how the
          algorithm would score the voicing path from the example above:
        </p>

        {lowMovementChords.length >= 3 && (
          <>
            <h3 className="text-lg font-medium mt-4 mb-2">Low Movement (scored)</h3>
            <div className="flex flex-wrap gap-2 items-center mb-4">
              <div>{chordToFingering(lowMovementChords[0], 150)}</div>
              <span className="text-lg font-semibold">&rarr; {compareChords(lowMovementChords[0], lowMovementChords[1])} &rarr;</span>
              <div>{chordToFingering(lowMovementChords[1], 150)}</div>
              <span className="text-lg font-semibold">&rarr; {compareChords(lowMovementChords[1], lowMovementChords[2])} &rarr;</span>
              <div>{chordToFingering(lowMovementChords[2], 150)}</div>
              <span className="text-lg font-semibold">= {compareChords(lowMovementChords[0], lowMovementChords[1]) + compareChords(lowMovementChords[1], lowMovementChords[2])}</span>
            </div>
          </>
        )}
        {highMovementChords.length >= 3 && (
          <>
            <h3 className="text-lg font-medium mt-4 mb-2">High Movement (scored)</h3>
            <div className="flex flex-wrap gap-2 items-center mb-4">
              <div>{chordToFingering(highMovementChords[0], 150)}</div>
              <span className="text-lg font-semibold">&rarr; {compareChords(highMovementChords[0], highMovementChords[1])} &rarr;</span>
              <div>{chordToFingering(highMovementChords[1], 150)}</div>
              <span className="text-lg font-semibold">&rarr; {compareChords(highMovementChords[1], highMovementChords[2])} &rarr;</span>
              <div>{chordToFingering(highMovementChords[2], 150)}</div>
              <span className="text-lg font-semibold">= {compareChords(highMovementChords[0], highMovementChords[1]) + compareChords(highMovementChords[1], highMovementChords[2])}</span>
            </div>
          </>
        )}

        <h2 className="text-xl font-semibold mt-6 mb-2">Instructions</h2>
        <p className="mb-4 text-muted-foreground">
          To try this out, enter chords into the selector either through the text box or drop down. I re-used
          the chord picker from another project so it'll let you pick the voicing in the preview window, and then
          will totally ignore it when actually solving the progression. If you want to see how this performs on
          a complex set of chord changes, hit the "Giant Steps" button, which takes some of the notoriously
          complex chord changes from{' '}
          <a href="https://www.youtube.com/watch?v=30FTr6G53VU" className="text-primary underline hover:text-primary/80" target="_blank" rel="noopener noreferrer">
            John Coltrane's "Giant Steps".
          </a>
        </p>
        <p className="mb-4 text-muted-foreground">
          You can click on any chord to sound it, and you can mouse over any note to sound it. This was only
          tested on desktop and may blow up on mobile.
        </p>
      </div>

      <Separator className="my-6" />

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

export default DijkstrasChordProgression
