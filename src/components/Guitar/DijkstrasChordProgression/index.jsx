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
            <h2>Background</h2>
            <p>I've been learning jazz guitar concepts recently, and I wanted to build some intuition around selecting
                chord voicings while comping (or playing chords to complement the bass and melody). For those unfamiliar
                with the space here's the general problem; in a given song I'll be provided chord changes that look
                something like "Dmin7 -> G7 -> Cmaj7". Each chord can be played a lot of different ways; for example
                a Cmaj7 requires me to hit C/E/G/B, but I can play in different octaves, I can invert them (play
                E/G/B/C), or play them on different places on the guitar neck or piano. Each specific way to play a
                chord is referred to as a voicing.
                <br/>
                <br/>
                Some combinations of chord voicings are easier to play than others. For the example of the "Dmin7 ->
                G7 -> Cmaj7" there is a combination of them that keeps all of my fingers between the 8th and 10th frets,
                and there are many more combinations that require moving all along the guitar neck.
                <br/>
                <br/>
                I wanted to figure out the lowest movement way to play a given chord progression, so I turned to some
                computer science. I implemented a scoring heuristic to compare the "distance" between two chord voicings.
                In this case it adds 1 point for every fret I need to move on each finger, it adds 2 points for every
                string I need to move over on each finger, and it adds bonus points if I have to move to or from a barre
                position (where one finger is holding down multiple strings).
                <br/>
                <br/>
                I then created a Directed Acyclic Graph of all voicings in the chord progression I'm trying to solve.
                In the example of the "Dmin7 -> G7 -> Cmaj7" the graph starts at a single node that represents the
                starting position, that node has edges that go to every possible Dmin7 voicing, and then each Dmin7
                voicing's node has edges going to each G7 voicing, etc. until I get to the end. The "distance" of the
                edge is equal to the scoring heuristic I mentioned above computed on the two target voicings. Once I've
                built the graph, I use Dijkstra's algorithm, a well known algorithm for finding the shortest path in
                a DAG system, to find the combination of voicings with the lowest total movement score.
                <br/>
                <br/>
                To make matters more confusing, you can sometimes substitute chords for other chords (for example a
                Dmin9 is a drop-in for a Dmin7 because it's just a Dmin7 + play the 9th note from D also), so I modified
                the solver to take a parameter that determines whether or not to use substitutions.
            </p>
            <h2>Instructions</h2>
            <p>
                To try this out, enter chords into the selector either through the text box or drop down. I re-used
                the chord picker from another project so it'll let you pick the voicing in the preview window, and then
                will totally ignore it when actually solving the progression. If you want to see how this performs on
                a complex set of chord changes, hit the "Giant Steps" button, which takes some of the notoriously
                complex chord changes from <a href="https://www.youtube.com/watch?v=30FTr6G53VU">
                John Coltrane's "Giant Steps".</a>
                <br/>
                <br/>
                You can click on any chord to sound it, and you can mouse over any note to sound it. This was only
                tested on desktop and may blow up on mobile.
                <br/>
                <br/>
                This is still definitely in the "work in progress" stages, and the algorithm is only as good as the
                library of chord voicings I've entered (which is tedious manual work I'm doing 10/day), so it is
                subject to evolve. If you have feedback or ideas, let me know!
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