import React, {useState} from 'react';

import { Box, Button, Container, Checkbox, TextField, FormGroup, FormControlLabel, Grid } from '@material-ui/core';
import GuitarFingering from '../GuitarFingering/GuitarFingering';
import { ProgressionSolver, ChordLibrary } from "../GuitarUtil";

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
    const [withSubstitutions, setWithSubstitutions] = useState(true);
    const [textBoxChord, setTextBoxChord] = useState("Bbdim7");
    const [chordNames, setChordNames] = useState([]);

    const handleCheckboxChange = (event) => {
        setWithSubstitutions(!withSubstitutions);
    }

    const handleTextBoxChange = (event) => {
        setTextBoxChord(event.target.value);
    }

    const handleTextBoxKeyPress = (event) => {
        if (event.key === "Enter") {
            console.log(textBoxChord);

            if (ChordLibrary.standard().get_all_by_name(textBoxChord, withSubstitutions).length > 0) {
                const newChordNames = []
                chordNames.forEach((chordName) => newChordNames.push(chordName));
                newChordNames.push(textBoxChord);
                setChordNames(newChordNames);
            } else {
                alert(`${textBoxChord} is an invalid chord name!`);
            }

            setTextBoxChord("");
        }
    }

    const giantSteps = () => {
        setTextBoxChord("");
        setWithSubstitutions(true);
        setChordNames([
            "Bmaj7", "D7", "Gmaj7", "Bb7", "Ebmaj7", "Amin7", "D7",
            "Gmaj7", "Bb7", "Ebmaj7", "F#7", "Bmaj7", "Fmin7", "Bb7",
            "Ebmaj7", "Amin7", "D7", "Gmaj7", "C#min7", "F#7", "Bmaj7",
            "Fmin7", "Bb7", "Ebmaj7", "C#min7", "F#7"
        ])
    }

    const chords = new ProgressionSolver().solve(chordNames, withSubstitutions);

    const fingerings = chords.map((chord) => {
        return <GuitarFingering width={280} {...chordToRenderable(chord)}/>
    })

    return (
        <Box m={2}>
            <Grid container direction="column" spacing={2}>
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
                    chord changes, hit the Giant Steps button. If you have cool ideas for how to improve this, hit me up!
                    <br/>
                    <br/>
                    Press enter while selecting the textbox to submit each new chord. Eventually I'll add a way to
                    remove and re-arrange chords but for now just refresh the page to restart.
                    </p>
                    <br/>
                </Grid>

                <Grid item xs={6}>
                    <Grid container direction="column" alignContent="flex-start" spacing={2}>
                        <Grid item>
                            <FormControlLabel control={
                                <Checkbox value={withSubstitutions} onChange={handleCheckboxChange}/>}
                                              label="Allow Equivalent Chord Substitutions" />
                        </Grid>

                        <Grid item>
                            <TextField value={textBoxChord} onChange={handleTextBoxChange} onKeyDown={handleTextBoxKeyPress} variant="outlined">Enter a Chord</TextField>

                        </Grid>

                        <Grid item>
                            <Button variant="contained" onClick={giantSteps}>Giant Steps Changes, Make My CPU Cry</Button>
                        </Grid>
                    </Grid>
                </Grid>

                <Grid item xs={12}>
                    <Grid container direction="row">
                        {fingerings}
                    </Grid>

                </Grid>
            </Grid>
        </Box>
    )
}

export default DijkstrasChordProgression;