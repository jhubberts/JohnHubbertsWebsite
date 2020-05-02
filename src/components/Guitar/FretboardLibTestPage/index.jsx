import React from 'react';

import { Fretboard, STANDARD_CHORD_LIBRARY } from '../GuitarUtil';

const FretboardLibTestPage = () => {
  const fretboard = new Fretboard();

  return (<div>
    <p>{JSON.stringify(fretboard.getNoteG(6, 8))}</p>
    <p>{JSON.stringify(STANDARD_CHORD_LIBRARY.get("A", "min7"))}</p>
    <p>{JSON.stringify(STANDARD_CHORD_LIBRARY.get("C", "11ty"))}</p>
  </div>);
};

export default FretboardLibTestPage;