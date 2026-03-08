import Conversions from './conversions'

const FLATS: string[] = ['Db', 'Eb', 'Gb', 'Ab', 'Bb']
const SHARPS: string[] = ['C#', 'D#', 'F#', 'G#', 'A#']
const NATURALS: string[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const NON_NATURALS: string[] = [...SHARPS, ...FLATS]
const ALL: string[] = [...FLATS, ...SHARPS, ...NATURALS]
const EQUIVALENCE: Record<string, string> = {
  Db: 'C#',
  Eb: 'D#',
  Gb: 'F#',
  Ab: 'G#',
  Bb: 'A#',

  'C#': 'Db',
  'D#': 'Eb',
  'F#': 'Gb',
  'G#': 'Ab',
  'A#': 'Bb',
}

const HALF_STEP = Math.pow(2, 1 / 12)
const TUNING_A_FREQUENCY_HZ = 440
const DISTANCE_FROM_MIDDLE_C_TO_TUNING_A = 9

const NOTE_TO_FREQUENCY_LOOKUP: Record<number, number> = {}
NOTE_TO_FREQUENCY_LOOKUP[DISTANCE_FROM_MIDDLE_C_TO_TUNING_A] = TUNING_A_FREQUENCY_HZ

class Note {
  name: string
  distanceFromMiddleC: number
  frequency: number

  constructor(props: { name: string; distanceFromMiddleC: number }) {
    this.name = props.name
    this.distanceFromMiddleC = props.distanceFromMiddleC
    this.frequency = Note.computeFrequency(this.distanceFromMiddleC)
  }

  static fromDistance(distanceFromMiddleC: number): Note {
    return new Note({
      name: Conversions.distanceFromCToNote(distanceFromMiddleC),
      distanceFromMiddleC: distanceFromMiddleC,
    })
  }

  transpose(transposeDistance: number): Note {
    return Note.fromDistance(this.distanceFromMiddleC + transposeDistance)
  }

  static computeFrequency(distanceFromMiddleC: number): number {
    if (!NOTE_TO_FREQUENCY_LOOKUP[distanceFromMiddleC]) {
      const distanceFromTuningA = distanceFromMiddleC - DISTANCE_FROM_MIDDLE_C_TO_TUNING_A
      if (distanceFromTuningA >= 0) {
        NOTE_TO_FREQUENCY_LOOKUP[distanceFromMiddleC] =
          TUNING_A_FREQUENCY_HZ * Math.pow(HALF_STEP, distanceFromTuningA)
      } else {
        NOTE_TO_FREQUENCY_LOOKUP[distanceFromMiddleC] =
          TUNING_A_FREQUENCY_HZ / Math.pow(HALF_STEP, -distanceFromTuningA)
      }
    }

    return NOTE_TO_FREQUENCY_LOOKUP[distanceFromMiddleC]
  }
}

export { Note, FLATS, SHARPS, NATURALS, NON_NATURALS, ALL, EQUIVALENCE }
export default Note
