import Conversions from "../Conversions";

class Note {
    constructor(props) {
        this.name = props.name;
        this.distanceFromMiddleC = props.distanceFromMiddleC;
    }

    static fromDistance(distanceFromMiddleC) {
        return new Note({
            name: Conversions.distanceFromCToNote(distanceFromMiddleC),
            distanceFromMiddleC: distanceFromMiddleC
        })
    }

    transpose(transposeDistance) {
        return Note.fromDistance(this.distanceFromMiddleC + transposeDistance);
    }
}

export default Note;