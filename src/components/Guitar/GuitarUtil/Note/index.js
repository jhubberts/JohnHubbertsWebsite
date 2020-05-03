import Conversions from "../Conversions";

const FLATS = ["Db", "Eb", "Gb", "Ab", "Bb"];
const SHARPS = ["C#", "D#", "F#", "G#", "A#"];
const NATURALS = ["C", "D", "E", "F", "G", "A", "B"];
const NON_NATURALS = [...SHARPS, ...FLATS];
const ALL = [...FLATS, ...SHARPS, ...NATURALS];
const EQUIVALENCE = {
    "Db": "C#",
    "Eb": "D#",
    "Gb": "F#",
    "Ab": "G#",
    "Bb": "A#",

    "C#": "Db",
    "D#": "Eb",
    "F#": "Gb",
    "G#": "Ab",
    "A#": "Bb"
}

const HALF_STEP = Math.pow(2, 1/12);
const TUNING_A_FREQUENCY_HZ = 440;
const DISTANCE_FROM_MIDDLE_C_TO_TUNING_A = 9;

const NOTE_TO_FREQUENCY_LOOKUP = {};
NOTE_TO_FREQUENCY_LOOKUP[DISTANCE_FROM_MIDDLE_C_TO_TUNING_A] = TUNING_A_FREQUENCY_HZ;

class Note {
    constructor(props) {
        this.name = props.name;
        this.distanceFromMiddleC = props.distanceFromMiddleC;
        this.frequency = Note.computeFrequency(this.distanceFromMiddleC);
    }

    static fromDistance(distanceFromMiddleC) {
        return new Note({
            name: Conversions.distanceFromCToNote(distanceFromMiddleC),
            distanceFromMiddleC: distanceFromMiddleC
        })
    }

    transpose(transposeDistance) {
        return Note.fromDistance(this.distanceFromMiddleC + transposeDistance);
    }

    static computeFrequency(distanceFromMiddleC) {
        // Lazy load
        if (!NOTE_TO_FREQUENCY_LOOKUP[distanceFromMiddleC]) {
            const distanceFromTuningA = distanceFromMiddleC - DISTANCE_FROM_MIDDLE_C_TO_TUNING_A;
            if (distanceFromTuningA >= 0) {
                NOTE_TO_FREQUENCY_LOOKUP[distanceFromMiddleC] = TUNING_A_FREQUENCY_HZ * Math.pow(HALF_STEP, distanceFromTuningA);
            } else {
                NOTE_TO_FREQUENCY_LOOKUP[distanceFromMiddleC] = TUNING_A_FREQUENCY_HZ / Math.pow(HALF_STEP, -distanceFromTuningA);
            }
        }

        return NOTE_TO_FREQUENCY_LOOKUP[distanceFromMiddleC];
    }
}

export { Note, FLATS, SHARPS, NATURALS, NON_NATURALS, ALL, EQUIVALENCE };
export default Note;