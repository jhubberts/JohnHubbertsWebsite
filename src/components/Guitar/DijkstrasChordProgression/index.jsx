import React, {useState} from 'react';

import { Box, Button, Checkbox, Divider, FormControlLabel, Grid } from '@material-ui/core';
import GuitarFingering from '../GuitarFingering/GuitarFingering';
import {ProgressionSolver, Synth} from "../GuitarUtil";
import ChordExplorer from "../ChordExplorer";

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

const DijkstrasChordProgression = () => {
    const [withSubstitutions, setWithSubstitutions] = useState(false);
    const [addOnEnter, setAddOnEnter] = useState(false);
    const [previewChord, setPreviewChord] = useState(null);
    const [chordNames, setChordNames] = useState([]);

    const audioContext = new AudioContext();
    const synth = new Synth({audioContext: audioContext});

    const createOnClick = (chord) => {
        return (event) => {
            synth.playChordForXSeconds(chord, 1)
        }
    }

    const createOnMouseOverNote = (chord) => {
        return (note) => {
            synth.playNoteForXSeconds(chord.notes[6 - note.string], 1)
        }
    }

    const handleSubstitutionBoxChange = (event) => {
        setWithSubstitutions(event.target.checked);
    }

    const handleAutoAddBoxChange = (event) => {
        setAddOnEnter(event.target.checked);
    }

    const addSelected = () => {
        const newChords = previewChord != null ? [...chordNames, previewChord.canonicalName] : [...chordNames];
        setChordNames(newChords);
    };

    const clearChords = () => {
        setChordNames([]);
    };

    const giantSteps = () => {
        setWithSubstitutions(false);
        setChordNames([
            "Bmaj7", "D7", "Gmaj7", "Bb7", "Ebmaj7", "Amin7", "D7",
            "Gmaj7", "Bb7", "Ebmaj7", "F#7", "Bmaj7", "Fmin7", "Bb7",
            "Ebmaj7", "Amin7", "D7", "Gmaj7", "C#min7", "F#7", "Bmaj7",
            "Fmin7", "Bb7", "Ebmaj7", "C#min7", "F#7"
        ])
    }

    const chords = new ProgressionSolver().solve(chordNames, withSubstitutions);

    const chordToFingering = (chord) => {
        return (<GuitarFingering width={280} {...chordToRenderable(chord)}
                                onClick={createOnClick(chord)}
                                onMouseOverNote={createOnMouseOverNote(chord)}/>);
    }

    const fingerings = chords.map(chordToFingering);

    const blurb = (
        <Grid item xs={12} align="left">
            <h1>Dijkstra's Chord Progression</h1>
            <p>I wanted to figure out the lowest movement way to play a given chord progression, so I implemented a
                rough heuristic to compare the "distance" between two chord voicings, then assembled a Directed Acyclic
                Graph (DAG) of possible chords (with or without substitutions), and used Dijkstra's algorithm to figure
                out the lowest cost path through the progression.
                <br/>
                <br/>
                To try it enter chords by name into the text box (e.x. Amaj7, Bb9, Cdim7, Amin9, Gmin7b5), and it'll
                autogenerate a fingering chart. The chord names are sensitive and I haven't imported many voicings,
                so you might get some weird results. If you want to see how it performs on a lot of complicated
                chord changes, hit the Giant Steps button. If you click on a chord, it'll sound the notes. If you
                mouse over a specific note it'll sound that note. If you have cool ideas for how to improve this,
                hit me up!
                <br/>
                <br/>
                Press enter while selecting the textbox to submit each new chord. Eventually I'll add a way to
                remove and re-arrange chords but for now just refresh the page to restart.
            </p>
            <br/>
        </Grid>
    )

    const controls = (
        <Grid item xs={4} align="left">
            <h2>Chord Selection and Controls</h2>
            <Grid item container direction="column" spacing={2}>
                <Grid item>
                    <ChordExplorer onSelection={(chord) => {
                        setPreviewChord(chord)
                        if (addOnEnter) {
                            addSelected();
                        }
                    }}/>
                </Grid>
                <Grid item>
                    <FormControlLabel control={
                        <Checkbox value={withSubstitutions} onChange={handleSubstitutionBoxChange}/>}
                                    label="Allow Equivalent Chord Substitutions" />
                </Grid>
                <Grid item>
                    <FormControlLabel control={
                        <Checkbox value={addOnEnter} onChange={handleAutoAddBoxChange}/>}
                                      label="Auto Add Chords on Enter Key" />
                </Grid>
                <Grid item container direction="row" alignContent="space-between" spacing={2}>
                    <Grid item>
                        <Button variant="contained" onClick={addSelected}>Add Chord</Button>
                    </Grid>
                    <Grid item>
                        <Button variant="contained" onClick={clearChords}>Clear Chords</Button>
                    </Grid>
                    <Grid item>
                        <Button variant="contained" onClick={giantSteps}>Giant Steps Changes, Make My CPU Cry</Button>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )

    const preview = (
        <Grid item xs={8} align="left">
            <h2>Chord Preview</h2>
            {previewChord != null && chordToFingering(previewChord)}
        </Grid>
    )

    const middlePart = (
        <Grid item container direction="row">
            {controls}
            {preview}
        </Grid>
    );

    return (
        <Box m={2}>
            <Grid container direction="column" spacing={2}>
                {blurb}
                <Divider/>
                {middlePart}
                <Divider/>
                <Grid item align="left">
                    <h2>Solution</h2>
                </Grid>
                <Grid item container direction="row" xs={12}>
                    {fingerings}
                </Grid>
            </Grid>
        </Box>
    )
}

export default DijkstrasChordProgression;