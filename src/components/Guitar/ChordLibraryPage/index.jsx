import React, {useState} from 'react';
import ChordExplorer from "../ChordExplorer";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import GuitarFingering from "../GuitarFingering/GuitarFingering";

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

const ChordLibraryPage = () => {
    const [activeChord, setActiveChord] = useState(null);

    return (
        <Box m={2}>
            <Grid container direction="row">
                <Grid item xs={3}>
                    <ChordExplorer onSelection={(chord) => setActiveChord(chord)}/>
                </Grid>
                {activeChord != null &&
                <Grid item xs={9}>
                    <GuitarFingering width={500} {...chordToRenderable(activeChord)}/>
                </Grid>}
            </Grid>
        </Box>
    )
}

export default ChordLibraryPage;