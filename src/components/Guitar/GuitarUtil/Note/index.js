import Conversions from "../Conversions";

const FLATS = ["Db", "Eb", "Gb", "Ab", "Bb"];
const SHARPS = ["C#", "D#", "F#", "G#", "A#"];
const NATURALS = ["C", "D", "E", "F", "G", "A", "B"];
const NON_NATURALS = [...SHARPS, ...FLATS];
const ALL = [].push(...FLATS, ...SHARPS, ...NATURALS);
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

class Note {
    constructor(props) {
        this.name = props.name;
        this.distanceFromMiddleC = props.distanceFromMiddleC;
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
}

export { Note, FLATS, SHARPS, NATURALS, NON_NATURALS, ALL, EQUIVALENCE };
export default Note;