class Synth {
    constructor(props) {
        this.audioContext = props.audioContext;
        this.active = [];
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = 0.2;
        this.gainNode.connect(this.audioContext.destination);
    }

    noteToOsc(note) {
        const osc = this.audioContext.createOscillator();
        osc.type = "sine"
        osc.frequency.value = note.frequency
        osc.connect(this.gainNode);
        return osc;
    }

    playChordForXSeconds(chord, seconds) {
        const oscs = chord.notes.filter((note) => !!note).map((note) => this.noteToOsc(note));
        this.stopActiveAndStartOscs(oscs, seconds);
    }

    playNoteForXSeconds(note, seconds) {
        this.stopActiveAndStartOscs([this.noteToOsc(note)], seconds);
    }

    stopActiveAndStartOscs(oscs, seconds) {
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

export default Synth