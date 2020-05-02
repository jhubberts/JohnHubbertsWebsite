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

const nameToIndexLookup = {
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

const intervalToChordToneLookup = {
  0: "1",
  1: "b9",
  2: "9",
  3: "b3",
  4: "3",
  5: "4",
  6: "#11/b5",
  7: "5",
  8: "b13",
  9: "6",
  10: "b7",
  11: "7"
}

function mod12(num) {
  let result = num % 12;
  while (result < 0) {
    result += 12;
  }
  return result;
}

class Note {
  constructor(props) {
    this.name = props.name;
    this.distanceFromMiddleC = props.distanceFromMiddleC;
  }

  static fromDistance(distanceFromMiddleC) {
    return new Note({
      name: distanceToNameLookup[mod12(distanceFromMiddleC)],
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

const STANDARD_FRETBOARD = new Fretboard();

class Chord {
  constructor(props) {
    props = props || {};

    this.name = props.name; // Doesn't include root, example would be Maj7
    this.singles = props.singles || [];
    this.barres = props.barres || [];
    this.root = props.root;
    this.withAnnotations = props.withAnnotations;

    if (this.withAnnotations) {
      this.annotations = ['', '', '', '', '', ''];

      for (let singleIdx in this.singles) {
        const single = this.singles[singleIdx];
        const targetNote = nameToIndexLookup[STANDARD_FRETBOARD.getNoteG(single.string, single.fret).name];
        const rootIndex = nameToIndexLookup[this.root];

        const distance = mod12(targetNote - rootIndex)

        this.annotations[6 - single.string] = intervalToChordToneLookup[distance];
      }
    }
  }

  transpose(newRoot) {
    const transposeDistance = mod12(nameToIndexLookup[newRoot] - nameToIndexLookup[this.root]);

    const lowestFret = Math.min(
        ...this.singles.map((single) => single.fret),
        ...this.barres.map((barre) => barre.fret));

    const transposeDown = (lowestFret + transposeDistance) >= 13;

    const newSingles = this.singles.map((single) => Object.assign({}, single));
    const newBarres = this.barres.map((barre) => Object.assign({}, barre));

    newSingles.forEach((single) => single.fret = transposeDown ?
        mod12(single.fret + transposeDistance):
        single.fret + transposeDistance);
    newBarres.forEach((barre) => barre.fret = transposeDown ?
        mod12(barre.fret + transposeDistance):
        barre.fret + transposeDistance);

    return new Chord({
      name: this.name,
      singles: newSingles,
      barres: newBarres,
      root: newRoot,
      withAnnotations: this.withAnnotations
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

const STANDARD_CHORD_LIBRARY = new ChordLibrary();

for (let name in chordShapes.standard.standardShapes) {
  for (let idx in chordShapes.standard.standardShapes[name]) {
    let chordJson = chordShapes.standard.standardShapes[name][idx];

    STANDARD_CHORD_LIBRARY.register(name, new Chord(Object.assign({name: name, root: "C", singles: [], barres: [], withAnnotations: true}, chordJson)));
  }
}

export { Chord, Fretboard, STANDARD_CHORD_LIBRARY };