import React, {useState} from 'react'

import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

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

  const firstRow = (
    <div>
      <Row>
        {canonicalNotes.slice(0, 6).map((newNote) => <Col><Button block onClick={() => handleUpdate(newNote, type, idx)}>{newNote}</Button></Col>)}
      </Row>
      <br/>
      <Row>
        {canonicalNotes.slice(6, 12).map((newNote) => <Col><Button block onClick={() => handleUpdate(newNote, type, idx)}>{newNote}</Button></Col>)}
      </Row>
    </div>
  );

  const secondRow = (
    <Row>
      {rootedShapeNames.map((newType) => <Col><Button block onClick={() => handleUpdate(note, newType, rootedShapes[newType][0].label)}>{newType}</Button></Col>)}
    </Row>
  );

  const thirdRow = (
    <Row>
      {rootedShapes[type].map((shape) => <Col><Button block onClick={() => handleUpdate(note, type, shape.label)}>{shape.label}</Button></Col>)}
    </Row>
  );

  const handleUpdate = (newNote, newType, newIdx) => {
    if (newNote != note) {
      setNote(newNote);
    }

    if (newType != type) {
      setType(newType);
    }

    if (newIdx != idx) {
      setIdx(newIdx);
    }

    setChord(getChord(newNote, newType, newIdx));
  };

  return (
    <Container fluid>
      <h1>Guitar Chord Library</h1>
      <p>I wrote a janky library to render chord shapes, both to learn about using the HTML5 canvas API from scratch
      and to help myself visualize things.</p>
      <Row>
        <Col>
          <h2>{`${note}${type} - ${idx}`}</h2>
          {<GuitarFingering width={280} chord={chord}/>}
        </Col>
        <Col>
          <h3>Root</h3>
          {firstRow}
          <br/>
          <h3>Chord</h3>
          {secondRow}
          <br/>
          <h3>Variant</h3>
          {thirdRow}
        </Col>
      </Row>
    </Container>)
};

export default ChordLibraryPage;