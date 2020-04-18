import React from 'react';

import { Fretboard } from '../GuitarUtil';

const FretboardLibTestPage = () => {
  const fretboard = new Fretboard();


  return (<div>
    <p>{JSON.stringify(fretboard.getNoteG(6, 8))}</p>
  </div>);
};

export default FretboardLibTestPage;