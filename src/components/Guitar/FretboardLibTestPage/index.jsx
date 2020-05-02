import React from 'react';

import { Chord, ChordLibrary } from '../GuitarUtil';
import GuitarFingering from "../GuitarFingering/GuitarFingering";

const chordToRenderable = (chord) => {
    return {
        chord: {
            singles: chord.singles || [],
            barres: chord.barres || []
        },
        annotations: chord.notes.map((interval) => interval == null ? "" : interval.name),
        title: chord.canonicalName
    }
}

const FretboardLibTestPage = () => {
  return (<div>
    <GuitarFingering
      width={280}
      {...chordToRenderable(ChordLibrary.standard().get("A", "min7")[1])}
    />

    <GuitarFingering
        width={280}
        {...chordToRenderable(new Chord({
          root: "Bb",
          name: "Weird",
          singles: [{
            finger: 4,
            string: 4,
            fret: 8
          }, {
            finger: 3,
            string: 3,
            fret: 6
          }, {
            finger: 2,
            string: 2,
            fret: 7
          }, {
            finger: 1,
            string: 1,
            fret: 5
          }]
        }))}
    />
  </div>);
};

export default FretboardLibTestPage;