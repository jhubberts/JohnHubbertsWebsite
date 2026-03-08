import Conversions from './conversions'
import Fretboard from './fretboard'
import Note from './note'

import standardShapes from './data/standard-shapes'
import substitutions from './data/substitutions.json'
import { ALL, NON_NATURALS } from './note'

export interface Single {
  finger?: number
  string: number
  fret: number
  isRoot?: boolean
}

export interface Barre {
  finger?: number
  fret: number
  startString: number
  endString: number
  voicedStrings: number[]
}

export interface ChordProps {
  name: string
  label?: string
  singles?: Single[]
  barres?: Barre[]
  inversion?: number
  root: string
  withAnnotations?: boolean
}

class Chord {
  name: string
  label: string
  singles: Single[]
  barres: Barre[]
  inversion: number
  root: string
  notes: (Note | undefined)[]
  intervals: (string | undefined)[]
  canonicalName: string

  constructor(props: ChordProps) {
    this.name = props.name // Doesn't include root, example would be Maj7
    this.label = props.label || ''
    this.singles = props.singles || []
    this.barres = props.barres || []
    this.inversion = props.inversion || 0
    this.root = props.root
    this.notes = Chord._getNotes(this.singles, this.barres)
    this.intervals = Chord._getIntervals(this.notes, this.root)

    this.canonicalName =
      this.inversion === 0
        ? `${this.root}${this.name}`
        : `${this.root}${this.name}/${Conversions.distanceFromCToNote(Conversions.noteToDistanceFromC(this.root) + this.inversion)}`
  }

  static _getNotes(singles: Single[], barres: Barre[]): (Note | undefined)[] {
    const notes: (Note | undefined)[] = Array(6)

    for (const singleIdx in singles) {
      const single = singles[singleIdx]
      const note = Fretboard.standard().getNoteG(single.string, single.fret)
      notes[6 - single.string] = note
    }

    for (const barreIdx in barres) {
      const barre = barres[barreIdx]
      for (const voicedStringIdx in barre.voicedStrings) {
        const voicedString = barre.voicedStrings[voicedStringIdx]

        notes[6 - voicedString] = Fretboard.standard().getNoteG(voicedString, barre.fret)
      }
    }

    return notes
  }

  static _getIntervals(notes: (Note | undefined)[], root: string): (string | undefined)[] {
    const intervals: (string | undefined)[] = Array(6)

    for (const noteIdx in notes) {
      const note = notes[noteIdx]
      if (note == null) {
        intervals[noteIdx] = undefined
        continue
      }

      intervals[noteIdx] = Conversions.intervalBetweenNotes(root, note.name)
    }

    return intervals
  }

  transpose(newRoot: string): Chord {
    const transposeDistance = Conversions.mod12(
      Conversions.noteToDistanceFromC(newRoot) - Conversions.noteToDistanceFromC(this.root),
    )

    const lowestFret = Math.min(
      ...this.singles.map((single) => single.fret),
      ...this.barres.map((barre) => barre.fret),
    )
    const transposeDown = lowestFret + transposeDistance >= 13

    const newSingles = this.singles.map((single) => Object.assign({}, single))
    const newBarres = this.barres.map((barre) => Object.assign({}, barre))

    newSingles.forEach(
      (single) =>
        (single.fret = transposeDown
          ? Conversions.mod12(single.fret + transposeDistance)
          : single.fret + transposeDistance),
    )
    newBarres.forEach(
      (barre) =>
        (barre.fret = transposeDown
          ? Conversions.mod12(barre.fret + transposeDistance)
          : barre.fret + transposeDistance),
    )

    return new Chord({
      name: this.name,
      singles: newSingles,
      barres: newBarres,
      inversion: this.inversion,
      root: newRoot,
      label: this.label,
    })
  }
}

let STANDARD_CHORD_LIBRARY: ChordLibrary | null = null

class ChordLibrary {
  chordsByName: Record<string, Chord[]>
  autocompleteChordNames: string[]

  constructor() {
    this.chordsByName = {}
    this.autocompleteChordNames = []
  }

  register(name: string, chord: Chord): void {
    if (!this.chordsByName[name]) {
      this.chordsByName[name] = []

      this.autocompleteChordNames.push(...ALL.map((note) => `${note}${name}`))
      this.autocompleteChordNames = this.autocompleteChordNames.sort()
    }

    this.chordsByName[name].push(chord)
  }

  get_autocomplete_dictionary(): string[] {
    return this.autocompleteChordNames
  }

  get_all_types(): string[] {
    return Object.keys(this.chordsByName).sort()
  }

  get_all_by_name(name: string, withSubstitutions: boolean): Chord[] {
    let root: string
    let shapeName: string

    if (NON_NATURALS.some((note) => name.startsWith(note))) {
      root = name.substring(0, 2)
      shapeName = name.substring(2)
    } else {
      root = name.substring(0, 1)
      shapeName = name.substring(1)
    }

    return this.get_all_by_root_and_name(root, shapeName, withSubstitutions)
  }

  get_all_by_root_and_name(root: string, shapeName: string, withSubstitutions: boolean): Chord[] {
    const shapeNames = [shapeName]

    if (withSubstitutions && (substitutions as Record<string, string[]>)[shapeName]) {
      shapeNames.push(...(substitutions as Record<string, string[]>)[shapeName])
    }

    const chords: Chord[] = []

    shapeNames.forEach((iShapeName) => {
      if (this.chordsByName[iShapeName]) {
        chords.push(...this.chordsByName[iShapeName])
      }
    })

    return root === 'C' ? chords : chords.map((chord) => chord.transpose(root))
  }

  get_by_root_name_and_label(root: string, shapeName: string, label: string): Chord | null {
    const matches = this.get_all_by_root_and_name(root, shapeName, false).filter(
      (chord) => chord.label === label,
    )
    return matches.length === 1 ? matches[0] : null
  }

  static standard(): ChordLibrary {
    if (STANDARD_CHORD_LIBRARY === null) {
      STANDARD_CHORD_LIBRARY = initializeStandardChordLibrary()
    }

    return STANDARD_CHORD_LIBRARY
  }
}

function initializeStandardChordLibrary(): ChordLibrary {
  const library = new ChordLibrary()

  for (const name in standardShapes.standardShapes) {
    const shapes = standardShapes.standardShapes[name] as ChordProps[]
    for (const idx in shapes) {
      const chordJson = shapes[idx]

      library.register(
        name,
        new Chord(
          Object.assign(
            { name: name, root: 'C', singles: [], barres: [], withAnnotations: true },
            chordJson,
          ),
        ),
      )
    }
  }

  return library
}

export { Chord, ChordLibrary }
