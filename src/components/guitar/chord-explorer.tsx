import { useEffect, useState } from 'react'
import { ChordLibrary, type Chord } from '@/lib/guitar'
import { NATURALS, SHARPS } from '@/lib/guitar/note'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

const NOTE_OPTIONS = [...NATURALS, ...SHARPS].sort()

interface ChordExplorerProps {
  onSelection?: (chord: Chord) => void
}

const ChordExplorer = ({ onSelection = () => {} }: ChordExplorerProps) => {
  const library = ChordLibrary.standard()
  const types = library.get_all_types()

  const [note, setNote] = useState(NOTE_OPTIONS[0])
  const [chordType, setChordType] = useState(types[0])
  const [autocompleteValue, setAutocompleteValue] = useState(`${NOTE_OPTIONS[0]}${types[0]}`)

  const chords = library.get_all_by_root_and_name(note, chordType, false)
  const shapeNames = chords.map((chord: Chord) => chord.label)

  const [chordShape, setChordShape] = useState(shapeNames[0])

  const chord = chords.filter((c: Chord) => c.label === chordShape)[0]

  const handleChangeAutocompleteBox = (fullName: string) => {
    if (!fullName) return

    let newRoot: string, newChordType: string
    if (fullName[1] === '#' || fullName[1] === 'b') {
      newRoot = fullName.substring(0, 2)
      newChordType = fullName.substring(2)
    } else {
      newRoot = fullName.substring(0, 1)
      newChordType = fullName.substring(1)
    }

    const matchingChords = library.get_all_by_root_and_name(newRoot, newChordType, false)
    if (matchingChords.length === 0) return

    setNote(newRoot)
    setChordType(newChordType)
    setChordShape(matchingChords[0].label)
    setAutocompleteValue(fullName)
  }

  const handleChangeRoot = (value: string) => {
    setNote(value)
    setAutocompleteValue(`${value}${chordType}`)
  }

  const handleChangeChordType = (value: string) => {
    setChordType(value)
    setChordShape(library.get_all_by_root_and_name(note, value, false)[0].label)
    setAutocompleteValue(`${note}${value}`)
  }

  const handleChangeChordName = (value: string) => {
    setChordShape(value)
  }

  useEffect(() => {
    if (chord) onSelection(chord)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note, chordType, chordShape])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="select-root" className="text-xs">
            Root
          </Label>
          <select
            id="select-root"
            value={note}
            onChange={(e) => handleChangeRoot(e.target.value)}
            className="border-input bg-background h-8 rounded-md border px-2 text-sm"
          >
            {NOTE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="select-chord-type" className="text-xs">
            Chord
          </Label>
          <select
            id="select-chord-type"
            value={chordType}
            onChange={(e) => handleChangeChordType(e.target.value)}
            className="border-input bg-background h-8 rounded-md border px-2 text-sm"
          >
            {types.map((type: string) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="select-chord-shape" className="text-xs">
            Shape
          </Label>
          <select
            id="select-chord-shape"
            value={chordShape}
            onChange={(e) => handleChangeChordName(e.target.value)}
            className="border-input bg-background h-8 rounded-md border px-2 text-sm"
          >
            {shapeNames.map((name: string) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <Label htmlFor="type-in-chord" className="text-xs">
          ...Or Type A Chord By Name
        </Label>
        <Input
          id="type-in-chord"
          list="chord-options"
          value={autocompleteValue}
          onChange={(e) => {
            setAutocompleteValue(e.target.value)
          }}
          onBlur={() => handleChangeAutocompleteBox(autocompleteValue)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleChangeAutocompleteBox(autocompleteValue)
            }
          }}
          className="h-8"
        />
        <datalist id="chord-options">
          {library.get_autocomplete_dictionary().map((name: string) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </div>
    </div>
  )
}

export default ChordExplorer
