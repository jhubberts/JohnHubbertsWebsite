import Conversions from "../Conversions";
import Fretboard from "../Fretboard";

import standardShapes from "./standardShapes";
import substitutions from "./substitutions.json";
import { ALL, NON_NATURALS } from "../Note";

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
            for (let voicedStringIdx in barre.voicedStrings) {
                const voicedString = barre.voicedStrings[voicedStringIdx];

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
            root: newRoot,
            label: this.label
        });
    }
}

let STANDARD_CHORD_LIBRARY = null;

class ChordLibrary {
    constructor() {
        this.chordsByName = {}
        this.autocompleteChordNames = [];
    }

    register(name, chord) {
        if (!this.chordsByName[name]) {
            this.chordsByName[name] = [];

            this.autocompleteChordNames.push(...ALL.map((note) => `${note}${name}`));
            this.autocompleteChordNames = this.autocompleteChordNames.sort();
        }

        this.chordsByName[name].push(chord);
    }

    get_autocomplete_dictionary() {
        return this.autocompleteChordNames;
    }

    get_all_types() {
        return Object.keys(this.chordsByName).sort();
    }

    get_all_by_name(name, withSubstitutions) {
        let root;
        let shapeName;

        if (NON_NATURALS.some((note) => name.startsWith(note))) {
            root = name.substring(0, 2);
            shapeName = name.substring(2);
        } else {
            root = name.substring(0, 1);
            shapeName = name.substring(1);
        }

        return this.get_all_by_root_and_name(root, shapeName, withSubstitutions);
    }

    get_all_by_root_and_name(root, shapeName, withSubstitutions) {
        const shapeNames = [shapeName];

        if (withSubstitutions && substitutions[shapeName]) {
            shapeNames.push(...substitutions[shapeName])
        }

        const chords = [];

        shapeNames.forEach((iShapeName) => {
            if (this.chordsByName[iShapeName]) {
                chords.push(...this.chordsByName[iShapeName]);
            }
        });

        return (root === "C") ? chords : chords.map((chord) => chord.transpose(root));
    }

    get_by_root_name_and_label(root, shapeName, label) {
        const matches = this.get_all_by_root_and_name(root, shapeName, false).filter((chord) => chord.label === label);
        return matches.length === 1 ? matches[0] : null;
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

