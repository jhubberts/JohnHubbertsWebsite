import type Note from "./note";

interface SynthProps {
    audioContext: AudioContext;
}

interface ChordLike {
    notes: (Note | null | undefined)[];
}

class Synth {
    audioContext: AudioContext;
    active: OscillatorNode[];
    gainNode: GainNode;

    constructor(props: SynthProps) {
        this.audioContext = props.audioContext;
        this.active = [];
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = 0.2;
        this.gainNode.connect(this.audioContext.destination);
    }

    noteToOsc(note: Note): OscillatorNode {
        const osc = this.audioContext.createOscillator();
        osc.type = "sine"
        osc.frequency.value = note.frequency
        osc.connect(this.gainNode);
        return osc;
    }

    playChordForXSeconds(chord: ChordLike, seconds: number): void {
        const oscs = chord.notes.filter((note): note is Note => !!note).map((note) => this.noteToOsc(note));
        this.stopActiveAndStartOscs(oscs, seconds);
    }

    playNoteForXSeconds(note: Note, seconds: number): void {
        this.stopActiveAndStartOscs([this.noteToOsc(note)], seconds);
    }

    stopActiveAndStartOscs(oscs: OscillatorNode[], seconds: number): void {
        this.active.forEach((osc) => osc.stop());
        this.active = [];

        let delay = 0;
        oscs.forEach((osc) => {
            osc.start(this.audioContext.currentTime + delay);
            delay += 0.06;
            osc.stop(this.audioContext.currentTime + seconds);
        });

        this.active.push(...oscs);
    }
}

export default Synth;
