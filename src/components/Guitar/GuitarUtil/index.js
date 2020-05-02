import Fretboard from "./Fretboard";
import { Chord, ChordLibrary } from "./Chord";

class ProgressionSolver {
    constructor(props) {

    }

    solve(chordNames) {
        const chords = ChordLibrary.standard().get_all_by_name("A#min7", true);

        return chords;
    }
};

export { Chord, ChordLibrary, Fretboard, ProgressionSolver };