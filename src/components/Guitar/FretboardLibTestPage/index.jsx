import React from 'react';

import {Chord, ChordLibrary, ProgressionSolver} from '../GuitarUtil';
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
  const progression = ["Gmin7", "Cmin7", "F7"];
  const chords = new ProgressionSolver().solve(progression);
  const fingeringCharts = chords.map((chord) => {
      return <GuitarFingering width={280} {...chordToRenderable(chord)} />
  })

  return (<div>
    {fingeringCharts}
  </div>);
};

export default FretboardLibTestPage;