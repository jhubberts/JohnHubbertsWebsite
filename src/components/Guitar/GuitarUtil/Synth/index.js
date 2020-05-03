class Synth {
    constructor(props) {
        this.audioContext = props.audioContext;
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = 0.2;
        this.gainNode.connect(this.audioContext.destination);
    }

    playChordForXSeconds(chord, seconds) {
        const frequencies = chord.notes.filter((note) => !!note).map((note) => note.frequency);
        const oscs = frequencies.map((frequency) => {
            const osc = this.audioContext.createOscillator();
            osc.type = "triangle"
            osc.frequency.value = frequency;
            osc.connect(this.gainNode);
            return osc;
        });

        oscs.forEach((osc) => {
            osc.start();
            osc.stop(this.audioContext.currentTime + seconds);
        });
    }
}

export default Synth