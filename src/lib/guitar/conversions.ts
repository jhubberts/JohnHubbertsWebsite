const NOTE_TO_DISTANCE_FROM_C: Record<string, number> = {
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
}

const _buildDistanceFromCToNotes = (): Record<number, string[]> => {
  const distanceFromCToNotes: Record<number, string[]> = {}
  for (const note in NOTE_TO_DISTANCE_FROM_C) {
    const distance = NOTE_TO_DISTANCE_FROM_C[note]
    if (!distanceFromCToNotes[distance]) {
      distanceFromCToNotes[distance] = []
    }
    distanceFromCToNotes[distance].push(note)
  }
  return distanceFromCToNotes
}

const DISTANCE_FROM_C_TO_NOTES = _buildDistanceFromCToNotes()

const INTERVAL_TO_CHORD_TONE: Record<number, string[]> = {
  0: ['1'],
  1: ['b9', 'b2'],
  2: ['9', '2'],
  3: ['b3'],
  4: ['3'],
  5: ['11', '4'],
  6: ['#11', '#4', 'b5'],
  7: ['5'],
  8: ['b13', '#5'],
  9: ['6'],
  10: ['b7'],
  11: ['7'],
}

const mod12 = (num: number): number => {
  return num >= 0 ? num % 12 : (num + (Math.floor(-num / 12) + 1) * 12) % 12
}

const distanceFromCToNote = (distance: number): string => {
  return DISTANCE_FROM_C_TO_NOTES[mod12(distance)][0]
}

const noteToDistanceFromC = (note: string): number => {
  return NOTE_TO_DISTANCE_FROM_C[note]
}

const intervalToChordTone = (interval: number): string => {
  return INTERVAL_TO_CHORD_TONE[mod12(interval)][0]
}

const intervalBetweenNotes = (bottom: string, top: string): string => {
  return intervalToChordTone(noteToDistanceFromC(top) - noteToDistanceFromC(bottom))
}

export default {
  distanceFromCToNote,
  noteToDistanceFromC,
  intervalToChordTone,
  intervalBetweenNotes,
  mod12,
}
