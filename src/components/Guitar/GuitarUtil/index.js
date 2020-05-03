import Fretboard from "./Fretboard";
import { Chord, ChordLibrary } from "./Chord";

/**
 * Compares two chords. Distance is a heuristic with the following properties:
 *
 * 1. Distance is directional from first to second. compare(A, B) != compare(B, A)
 * 2. Low weight means closer fingerings
 * 3. Distance 0 means two chords are identical, or the 2nd chord is a subset of the first chord (e.g. the 2nd chord
 *    is a lean chord using tones from the 1st chord)
 * 4. Every string you need to move a finger over is worth 2 points
 * 5. Every fret you need to move a finger over is worth 1 point
 * 6. Moving to a barre cost 5 points + fret movement
 * 7. Moving from a barre costs 3 points + fret movement
 */
const compareChords = (first, second) => {
    let distance = 0;

    for (let finger = 1; finger <= 4; finger++) {
        const firstSingles = first.singles.filter((single) => single.finger == finger);
        const secondSingles = second.singles.filter((single) => single.finger == finger);

        // Assume everything is OK, don't be defensive
        const fromSingle = firstSingles.length === 1;
        const toSingle = secondSingles.length === 1;

        if (!toSingle || !fromSingle) {
            continue; // Drop finger, + 0
        }

        distance += Math.abs(secondSingles[0].fret - firstSingles[0].fret);
        distance += 2 * Math.abs(secondSingles[0].string - firstSingles[0].string);

        // No barres yet!
    }

    return distance;
}

const INFINITY = 999999;

class GraphNode {
    constructor(chord) {
        this.chord = chord;
        this.connections = [];

        // Weird abstractions
        this.totalDistance = INFINITY;
        this.path = [];
        this.queued = false;
    }

    addConnection(node, distance) {
        this.connections.push([node, distance]);
    }
}

class ProgressionSolver {
    constructor(props) {}

    solve(chordNames) {
        const progressionColumns = chordNames.map((chordName) => ChordLibrary.standard().get_all_by_name(chordName, true));

        const start = new GraphNode(null);
        start.totalDistance = 0;

        const end = new GraphNode(null);
        const progressionColumnsAsNodes = progressionColumns.map((chords) => {
            return chords.map((chord) => {
                return new GraphNode(chord);
            })
        });

        // 0 connections from start
        for (let i = 0; i < progressionColumnsAsNodes[0].length; i++) {
            start.addConnection(progressionColumnsAsNodes[0][i], 0);
        }

        // 0 connections to end
        for (let i = 0; i < progressionColumnsAsNodes[progressionColumnsAsNodes.length - 1].length; i++) {
            progressionColumnsAsNodes[progressionColumnsAsNodes.length - 1][i].addConnection(end, 0);
        }

        for (let i = 0; i < progressionColumnsAsNodes.length - 1; i++) {
            for (let j = 0; j < progressionColumnsAsNodes[i].length; j++) {
                for (let k = 0; k < progressionColumnsAsNodes[i + 1].length; k++) {
                    const from = progressionColumnsAsNodes[i][j];
                    const to = progressionColumnsAsNodes[i + 1][k];
                    const distance = compareChords(from.chord, to.chord);
                    from.addConnection(to, distance);
                }
            }
        }

        this.dijkstraAnnotate(start);

        console.log(end);

        let shortestPath = [];
        for (let i = 1; i < end.path.length; i++) {
            shortestPath.push(end.path[i].chord);
        }

        return shortestPath;
    }

    dijkstraAnnotate(start) {
        const queue = [start];

        while (queue.length !== 0) {
            const curr = queue.shift();

            for (let connectionIdx in curr.connections) {
                const connectionParts = curr.connections[connectionIdx];
                const connection = connectionParts[0];
                const distance = connectionParts[1];

                if (!connection.queued) {
                    connection.queued = true;
                    queue.push(connection);
                }

                if (curr.totalDistance + distance < connection.totalDistance) {
                    connection.totalDistance = curr.totalDistance + distance;
                    const pathCopy = []
                    curr.path.forEach((node) => pathCopy.push(node));
                    pathCopy.push(curr);
                    connection.path = pathCopy;
                }
            }
        }
    }
};

export { Chord, ChordLibrary, Fretboard, ProgressionSolver };