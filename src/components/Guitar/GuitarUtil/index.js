import chordShapes from "./shapes";

const STANDARD_ROOT_DISTANCE_FROM_MIDDLE_C = [4, -1, -5, -10, -15, -20];
const DEFAULT_TUNING_OFFSETS = [0, 0, 0, 0, 0, 0];
const DEFAULT_NFRETS = 21;

const distanceToNameLookup = {
  0: 'C',
  1: 'C#',
  2: 'D',
  3: 'D#',
  4: 'E',
  5: 'F',
  6: 'F#',
  7: 'G',
  8: 'G#',
  9: 'A',
  10: 'A#',
  11: 'B'
};

let nameToIndexLookup = {
  'C': 0,
  'C#': 1,
  'Db': 1,
  'D': 2,
  'D#': 3,
  'Eb': 3,
  'E': 4,
  'F': 5,
  'F#': 6,
  'Gb': 6,
  'G': 7,
  'G#': 8,
  'Ab': 8,
  'A': 9,
  'A#': 10,
  'Bb': 10,
  'B': 11
}

class Note {
  constructor(props) {
    this.name = props.name;
    this.distanceFromMiddleC = props.distanceFromMiddleC;
  }

  static fromDistance(distanceFromMiddleC) {
    return new Note({
      name: distanceToNameLookup[distanceFromMiddleC % 12],
      distanceFromMiddleC: distanceFromMiddleC
    })
  }
}

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
}

class Chord {
  constructor(props) {
    props = props || {};

    this.name = props.name; // Doesn't include root, example would be Maj7
    this.singles = props.singles;
    this.barres = props.barres;
    this.root = props.root;
  }

  transpose(newRoot) {
    const transposeDistance = (nameToIndexLookup[newRoot] - nameToIndexLookup[this.root]) % 12;
    console.log(transposeDistance);

    const lowestFret = Math.min(
        ...this.singles.map((single) => single.fret),
        ...this.barres.map((barre) => barre.fret));

    const transposeDown = (lowestFret + transposeDistance) >= 13;

    const newSingles = this.singles.map((single) => Object.assign({}, single));
    const newBarres = this.barres.map((barre) => Object.assign({}, barre));

    newSingles.forEach((single) => single.fret = transposeDown ?
        (single.fret + transposeDistance) % 12 :
        single.fret + transposeDistance);
    newBarres.forEach((barre) => barre.fret = transposeDown ?
        (barre.fret + transposeDistance) % 12 :
        barre.fret + transposeDistance);

    return new Chord({
      name: this.name,
      singles: newSingles,
      barres: newBarres,
      root: newRoot
    });
  }
}

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

    if (root == "C") {
      return this.chordsByName[name];
    }

    return this.chordsByName[name].map((chord) => chord.transpose(root));
  }
}

const STANDARD_FRETBOARD = new Fretboard();
const STANDARD_CHORD_LIBRARY = new ChordLibrary();

for (let name in chordShapes.standard.standardShapes) {
  for (let idx in chordShapes.standard.standardShapes[name]) {
    let chordJson = chordShapes.standard.standardShapes[name][idx];

    STANDARD_CHORD_LIBRARY.register(name, new Chord(Object.assign({name: name, root: "C", singles: [], barres: []}, chordJson)));
  }
}

export { Fretboard, STANDARD_CHORD_LIBRARY };