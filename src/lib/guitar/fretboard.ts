import Note from "./note";

const STANDARD_ROOT_DISTANCE_FROM_MIDDLE_C: number[] = [4, -1, -5, -10, -15, -20];
const DEFAULT_TUNING_OFFSETS: number[] = [0, 0, 0, 0, 0, 0];
const DEFAULT_NFRETS = 21;

let STANDARD_FRETBOARD: Fretboard | null = null;

interface FretboardProps {
    tuningOffsets?: number[];
    nFrets?: number;
}

class Fretboard {
    strings: Note[][];

    constructor(props?: FretboardProps) {
        props = props || {};

        const tuningOffsets = props.tuningOffsets || DEFAULT_TUNING_OFFSETS;
        const nFrets = props.nFrets || DEFAULT_NFRETS;

        this.strings = [];

        for (const stringIdx in STANDARD_ROOT_DISTANCE_FROM_MIDDLE_C) {
            const string: Note[] = [];
            const offset = STANDARD_ROOT_DISTANCE_FROM_MIDDLE_C[stringIdx] + tuningOffsets[stringIdx];
            for (let fretIdx = 0; fretIdx <= nFrets; fretIdx++) { // NFrets + 1 more for open position
                string.push(Note.fromDistance(offset + fretIdx));
            }

            this.strings.push(string);
        }
    }

    // Get note programmer notation, 6th string is 0, open fret is 0
    getNoteP(string: number, fret: number): Note {
        return this.getNoteG(6 - string, fret);
    }

    // Get note guitar notation, 6th string is 6, open fret is 0
    getNoteG(string: number, fret: number): Note {
        return this.strings[string - 1][fret];
    }

    static standard(): Fretboard {
        if (STANDARD_FRETBOARD === null) {
            STANDARD_FRETBOARD = new Fretboard();
        }

        return STANDARD_FRETBOARD;
    }
}

export default Fretboard;
