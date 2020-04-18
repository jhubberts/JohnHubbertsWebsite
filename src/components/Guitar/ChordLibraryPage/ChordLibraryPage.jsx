import React, {useState} from 'react'

import { Container, FormControl, Select, MenuItem, InputLabel } from '@material-ui/core';

import GuitarFingering from "../GuitarFingering/GuitarFingering";

import rootedShapes from "./rootedChordShapes";

const rootedShapeNames = Object.keys(rootedShapes);

const noteNameToIdx = {
  "C": 0,
  "C#": 1,
  "Db": 1,
  "D": 2,
  "D#": 3,
  "Eb": 3,
  "E": 4,
  "F": 5,
  "F#": 6,
  "Gb": 6,
  "G": 7,
  "G#": 8,
  "Ab": 8,
  "A": 9,
  "A#": 10,
  "Bb": 10,
  "B": 11
};

const canonicalNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const getChord = (note, type, idx) => {
  const shape = rootedShapes[type].filter((someShape) => someShape.label === idx)[0];
  const chord = {singles: [], barres: []};

  if (shape.annotations) {
    Object.assign(chord, {annotations: shape.annotations});
  }

  const transposeDistance = noteNameToIdx[note]; // All of these are C fingerings

  const shouldGoDown = Math.min(shape.singles.map((single) => single.fret)) > 13 || (shape.barres  && Math.min(shape.barres.map((barre) => barre.fret)) > 13);

  shape.singles.forEach((single) => chord.singles.push(Object.assign({}, single)));
  if (shape.barres) {
    shape.barres.forEach((barre) => chord.barres.push(Object.assign({}, barre)));
  }

  chord.singles.forEach((single) => single.fret = shouldGoDown ?
    single.fret + transposeDistance - 12:
    single.fret + transposeDistance);

  chord.barres.forEach((barre) => barre.fret = shouldGoDown ?
    barre.fret + transposeDistance - 12:
    barre.fret + transposeDistance);

  return chord;
};

const ChordLibraryPage = () => {
  const [note, setNote] = useState("C");
  const [type, setType] = useState(rootedShapeNames[0]);
  const [idx, setIdx] = useState(rootedShapes[type][0].label);
  const [chord, setChord] = useState(getChord(note, type, idx));

  const noteForm = (
    <FormControl>
      <InputLabel id="notes-input-label">Root Note</InputLabel>
      <Select
        labelId="notes-input-label"
        id="notes-input"
        value={note}
        onChange={(event) => handleUpdate(event.target.value, type, idx)}
        >
        {canonicalNotes.map((newNote) => <MenuItem key={`note-menu-item-${newNote}`} value={newNote}>{newNote}</MenuItem>)}
      </Select>
    </FormControl>
  );

  const shapeForm = (
    <FormControl>
      <InputLabel id="shape-input-label">Chord</InputLabel>
      <Select
        labelId="shape-input-label"
        id="shape-input"
        value={type}
        onChange={(event) => handleUpdate(note, event.target.value, rootedShapes[event.target.value][0].label)}
      >
        {rootedShapeNames.map((newType) => <MenuItem key={`shape-menu-item-${newType}`}  value={newType}>{newType}</MenuItem>)}
      </Select>
    </FormControl>
  );

  const variantForm = (
    <FormControl>
      <InputLabel id="variant-input-label">Variant</InputLabel>
      <Select
        labelId="variant-input-label"
        id="variant-input"
        value={idx}
        onChange={(event) => handleUpdate(note, type, event.target.value)}
      >
        {rootedShapes[type].map((newVariant) => <MenuItem key={`variant-menu-item-${newVariant.label}`}  value={newVariant.label}>{newVariant.label}</MenuItem>)}
      </Select>
    </FormControl>
  );

  const handleUpdate = (newNote, newType, newIdx) => {
    if (newNote !== note) {
      setNote(newNote);
    }

    if (newType !== type) {
      setType(newType);
    }

    if (newIdx !== idx) {
      setIdx(newIdx);
    }

    setChord(getChord(newNote, newType, newIdx));
  };

  return (
    <Container>
      <h1>Guitar Chord Library</h1>
      <p>I wrote a janky library to render chord shapes, both to learn about using the HTML5 canvas API from scratch
    and to help myself visualize things.</p>
      <div>
        {noteForm}
        {shapeForm}
        {variantForm}
      </div>
      <h2>{`${note}${type} - ${idx}`}</h2>
      {<GuitarFingering width={280} chord={chord}/>}
    </Container>)
};

export default ChordLibraryPage;