import React, {useState} from 'react'

import Button from 'react-bootstrap/Button'

import GuitarFingering from "../GuitarFingering/GuitarFingering";

const ChordLibraryPage = () => {
  const [chord, setChord] = useState("DMin7");

  return (
    <div>
      <Button onClick={() => setChord("AMaj Barre")}>AMaj Barre</Button>
      <Button onClick={() => setChord("DMin7")}>DMin7</Button>
      <GuitarFingering width={280} chordName={chord}/>
    </div>)
};

export default ChordLibraryPage;