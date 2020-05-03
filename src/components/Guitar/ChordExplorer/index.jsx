import React, {useEffect, useState} from 'react';

import { Grid, FormControl, InputLabel, Select } from "@material-ui/core";
import { ChordLibrary } from "../GuitarUtil";
import { NATURALS, SHARPS } from "../GuitarUtil/Note";

const NOTE_OPTIONS = [...NATURALS, ...SHARPS].sort();

const ChordExplorer = (props) => {
    const onSelection = props.onSelection || (() => {});

    const library = ChordLibrary.standard();
    const types = library.get_all_types();

    const [note, setNote] = useState(NOTE_OPTIONS[0]);
    const [chordType, setChordType] = useState(types[0]);

    const chords = library.get_all_by_root_and_name(note, chordType, false);
    const shapeNames = chords.map((chord) => chord.label);

    const [chordShape, setChordShape] = useState(shapeNames[0])

    const chord = chords.filter((chord) => chord.label === chordShape)[0];

    const handleChangeRoot = (event) => {
        setNote(event.target.value);
    }

    const handleChangeChordType = (event) => {
        setChordType(event.target.value);
    }

    const handleChangeChordName = (event) => {
        setChordShape(event.target.value);
    }

    useEffect(() => {
        onSelection(chord);
    }, [note, chordType, chordShape]);

    return (
        <Grid container direction="row">
            <div>
                <FormControl>
                    <InputLabel shrink htmlFor="select-root">
                        Root
                    </InputLabel>
                    <Select
                        native
                        value={note}
                        onChange={handleChangeRoot}
                        inputProps={{id: "select-root"}}
                    >
                        {NOTE_OPTIONS.map((newRoot) => (<option key={newRoot} value={newRoot}>{newRoot}</option>))}
                    </Select>
                </FormControl>
                <FormControl>
                    <InputLabel shrink htmlFor="select-chord-type">
                        Chord
                    </InputLabel>
                    <Select
                        native
                        value={chordType}
                        onChange={handleChangeChordType}
                        inputProps={{id: "select-chord-type"}}
                    >
                        {types.map((type) => (<option key={type} value={type}>{type}</option>))}
                    </Select>
                </FormControl>
                <FormControl>
                    <InputLabel shrink htmlFor="select-chord-shape">
                        Shape
                    </InputLabel>
                    <Select
                        native
                        value={chordShape}
                        onChange={handleChangeChordName}
                        inputProps={{id: "select-chord-shape"}}
                    >
                        {shapeNames.map((shapeName) => (<option key={shapeName} value={shapeName}>{shapeName}</option>))}
                    </Select>
                </FormControl>
            </div>
        </Grid>
    )
}

export default ChordExplorer