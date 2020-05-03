import React, {useEffect, useState} from 'react';

import { Autocomplete } from "@material-ui/lab";
import { Grid, FormControl, InputLabel, Select, TextField } from "@material-ui/core";
import { ChordLibrary } from "../GuitarUtil";
import { NATURALS, SHARPS } from "../GuitarUtil/Note";

const NOTE_OPTIONS = [...NATURALS, ...SHARPS].sort();

const ChordExplorer = (props) => {
    const onSelection = props.onSelection || (() => {});

    const library = ChordLibrary.standard();
    const types = library.get_all_types();

    const [note, setNote] = useState(NOTE_OPTIONS[0]);
    const [chordType, setChordType] = useState(types[0]);

    const [autocompleteValue, setAutocompleteValue] = useState(`${note}${chordType}`)

    const chords = library.get_all_by_root_and_name(note, chordType, false);
    const shapeNames = chords.map((chord) => chord.label);

    const [chordShape, setChordShape] = useState(shapeNames[0])

    const chord = chords.filter((chord) => chord.label === chordShape)[0];

    const handleChangeAutocompleteBox = (ignoreMe, fullName) => {
        let newRoot, newChordType;

        // Handle backspace everywhere

        if (fullName[1] === "#" || fullName[1] === "b") {
            newRoot = fullName.substring(0, 2);
            newChordType = fullName.substring(2);
        } else {
            newRoot = fullName.substring(0, 1);
            newChordType = fullName.substring(1);
        }

        setNote(newRoot);
        setChordType(newChordType);
        setChordShape(library.get_all_by_root_and_name(newRoot, newChordType, false)[0].label)
        setAutocompleteValue(fullName);
    }

    const handleChangeRoot = (event) => {
        setNote(event.target.value);
        setAutocompleteValue(`${event.target.value}${chordType}`);
    }

    const handleChangeChordType = (event) => {
        setChordType(event.target.value);
        setChordShape(library.get_all_by_root_and_name(note, event.target.value, false)[0].label)
        setAutocompleteValue(`${note}${event.target.value}`);
    }

    const handleChangeChordName = (event) => {
        setChordShape(event.target.value);
    }

    useEffect(() => {
        onSelection(chord);
    }, [note, chordType, chordShape]);

    return (
            <Grid container direction="column" spacing={2} alignContent="flex-start">
                <Grid item>
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
                </Grid>
                <Grid item>
                    <Autocomplete
                        autoComplete={true}
                        autoSelect={true}
                        value={autocompleteValue}
                        id="type-in-chord"

                        onChange={handleChangeAutocompleteBox}
                        options={library.get_autocomplete_dictionary()}
                        renderInput={(params) => {
                            return <TextField {...params} label="...Or Type A Chord" variant="outlined" />
                        }} />
                </Grid>
            </Grid>
    )
}

export default ChordExplorer