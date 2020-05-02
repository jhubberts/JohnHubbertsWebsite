import Note from "../Note";

const STANDARD_ROOT_DISTANCE_FROM_MIDDLE_C = [4, -1, -5, -10, -15, -20];
const DEFAULT_TUNING_OFFSETS = [0, 0, 0, 0, 0, 0];
const DEFAULT_NFRETS = 21;

let STANDARD_FRETBOARD = null;

class Fretboard {
    constructor(props) {
        props = props || {};

        const tuningOffsets = props.tuningOffsets || DEFAULT_TUNING_OFFSETS;
        const nFrets = props.nFrets || DEFAULT_NFRETS;

        this.strings = [];

        for (let stringIdx in STANDARD_ROOT_DISTANCE_FROM_MIDDLE_C) {
            let string = [];
            const offset = STANDARD_ROOT_DISTANCE_FROM_MIDDLE_C[stringIdx] + tuningOffsets[stringIdx];
            for (let fretIdx = 0; fretIdx <= nFrets; fretIdx++) { // NFrets + 1 more for open position
                string.push(Note.fromDistance(offset + fretIdx));
            }

            this.strings.push(string);
        }
    }

    // Get note programmer notation, 6th string is 0, open fret is 0
    getNoteP(string, fret) {
        return this.getNoteG(6 - string, fret);
    }

    // Get note guitar notation, 6th string is 6, open fret is 0
    getNoteG(string, fret) {
        return this.strings[string - 1][fret];
    }

    static standard() {
        if (STANDARD_FRETBOARD === null) {
            STANDARD_FRETBOARD = new Fretboard();
        }

        return STANDARD_FRETBOARD;
    }
}

export default Fretboard