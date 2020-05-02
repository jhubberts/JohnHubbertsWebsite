import React from 'react';

import { Chord, STANDARD_CHORD_LIBRARY } from '../GuitarUtil';
import GuitarFingering from "../GuitarFingering/GuitarFingering";

const FretboardLibTestPage = () => {
  return (<div>
    <GuitarFingering
      width={280}
      chord={STANDARD_CHORD_LIBRARY.get("A", "min7")[1]}
    />

    <GuitarFingering
        width={280}
        chord={new Chord({
          root: "Bb",
          withAnnotations: true,
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
        })}
    />
  </div>);
};

export default FretboardLibTestPage;