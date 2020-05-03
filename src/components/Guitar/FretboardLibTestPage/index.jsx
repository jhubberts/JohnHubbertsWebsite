import React from 'react';

import { ProgressionSolver, Synth } from '../GuitarUtil';
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
  const audioContext = new AudioContext();
  const synth = new Synth({audioContext: audioContext});
  // const progression = ["Bmaj7", "D7", "Gmaj7", "Bb7", "Ebmaj7", "Amin7"];
  const progression = ["Bmaj7"];
  const chords = new ProgressionSolver().solve(progression);
  chords.forEach((chord) => console.log(chord.notes));

  const fingeringCharts = chords.map((chord) => {
      return <GuitarFingering width={280} {...chordToRenderable(chord)}
        onClick={() => {synth.playChordForXSeconds(chord, 1)}}/>
  })

  return (<div>
    {fingeringCharts}
  </div>);
};

export default FretboardLibTestPage;