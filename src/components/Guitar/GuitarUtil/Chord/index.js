import Conversions from "../Conversions";
import Fretboard from "../Fretboard";

import standardShapes from "./standardShapes";

class Chord {
    constructor(props) {
        props = props || {};

        this.name = props.name; // Doesn't include root, example would be Maj7
        this.label = props.label || "";
        this.singles = props.singles || [];
        this.barres = props.barres || [];
        this.root = props.root;
        this.notes = Chord._getNotes(this.singles, this.barres);
        this.intervals = Chord._getIntervals(this.notes, this.root);
        this.canonicalName = `${this.root}${this.name}`;
    }

    static _getNotes(singles, barres) {
        const notes = Array(6);

        for (let singleIdx in singles) {
            const single = singles[singleIdx];
            const note = Fretboard.standard().getNoteG(single.string, single.fret);
            notes[6 - single.string] = note;
        }

        for (let barreIdx in barres) {
            const barre = barres[barreIdx];
            for (let voicedString in barre.voicedString) {
                notes[6 - voicedString] = Fretboard.standard().getNoteG(voicedString, barre.fret);
            }
        }

        return notes;
    }

    static _getIntervals(notes, root) {
        const intervals = Array(6);

        for (const noteIdx in notes) {
            const note = notes[noteIdx];
            if (note === null) {
                intervals[noteIdx] = null;
                continue;
            }

            intervals[noteIdx] = Conversions.intervalBetweenNotes(root, note.name);
        }

        return intervals;
    }

    transpose(newRoot) {
        const transposeDistance = Conversions.mod12(Conversions.noteToDistanceFromC(newRoot) - Conversions.noteToDistanceFromC(this.root));

        const lowestFret = Math.min(...this.singles.map((single) => single.fret), ...this.barres.map((barre) => barre.fret));
        const transposeDown = (lowestFret + transposeDistance) >= 13;

        const newSingles = this.singles.map((single) => Object.assign({}, single));
        const newBarres = this.barres.map((barre) => Object.assign({}, barre));

        newSingles.forEach((single) => single.fret = transposeDown ?
            Conversions.mod12(single.fret + transposeDistance):
            single.fret + transposeDistance);
        newBarres.forEach((barre) => barre.fret = transposeDown ?
            Conversions.mod12(barre.fret + transposeDistance):
            barre.fret + transposeDistance);

        return new Chord({
            name: this.name,
            singles: newSingles,
            barres: newBarres,
            root: newRoot
        });
    }
}

let STANDARD_CHORD_LIBRARY = null;

class ChordLibrary {
    constructor() {
        this.chordsByName = {}
    }

    register(name, chord) {
        if (!this.chordsByName[name]) {
            this.chordsByName[name] = [];
        }

        this.chordsByName[name].push(chord);
    }

    get(root, name) {
        if (!this.chordsByName[name]) {
            return [];
        }

        if (root === "C") {
            return this.chordsByName[name];
        }

        return this.chordsByName[name].map((chord) => chord.transpose(root));
    }

    static standard() {
        if (STANDARD_CHORD_LIBRARY === null) {
            STANDARD_CHORD_LIBRARY = initializeStandardChordLibrary();
        }

        return STANDARD_CHORD_LIBRARY;
    }
}

function initializeStandardChordLibrary() {
    const library = new ChordLibrary();

    for (let name in standardShapes.standardShapes) {
        for (let idx in standardShapes.standardShapes[name]) {
            let chordJson = standardShapes.standardShapes[name][idx];

            library.register(name, new Chord(Object.assign({name: name, root: "C", singles: [], barres: [], withAnnotations: true}, chordJson)));
        }
    }

    return library;
}

export { Chord, ChordLibrary }

