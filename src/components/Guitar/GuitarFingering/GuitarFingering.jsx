import React, {useEffect} from "react";

const guitarStringToZeroOffset = (stringNum) => {
  return 6 - stringNum;
};

class FingeringChart {
  constructor(canvas, stringSpacing, fretSpacing, startFret, endFret, singles, barres, annotations, title) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.singles = singles || [];
    this.barres = barres;
    this.annotations = annotations;
    this.title = title;

    this.stringSpacing = stringSpacing;
    this.fretSpacing = fretSpacing;
    this.startFret = startFret;
    this.endFret = endFret;

    this.fretboardOriginX = stringSpacing * 1.5;
    this.fretboardOriginY = fretSpacing; // Leave room for annotations
    this.fretboardWidth = stringSpacing * 5; // 6 strings = 5 gaps between strings
    this.nFrets = (endFret - startFret);
    this.fretboardHeight = fretSpacing * (this.nFrets + 1);

    const titleFontSize = stringSpacing * 0.8
    this.titleFont = `bold ${titleFontSize}px Arial`;

    const fingerNumberFontSize = stringSpacing * 0.5;
    this.fingerNumberFont = `bold ${fingerNumberFontSize}px Arial`;

    const annotationFontSize = stringSpacing * 0.35;
    this.annotationFont = `${annotationFontSize}px Arial`;

    this.hitBoxes = this.singles.map((single) => [this.getSingleHitbox(single), single]);

    this.highlighted = [];
  }

  getOverlappingHitboxes(x, y) {
    return this.hitBoxes.filter((hitbox) => {
      const [hitX, hitY, hitRadius] = hitbox[0];

      return Math.sqrt(Math.pow(x - hitX, 2) + Math.pow(y - hitY, 2)) <= hitRadius;
    }).map((hitbox) => hitbox[1]);
  }

  highlight(string, fret) {
    this.highlighted.push({string: string, fret: fret});
  }

  unhighlight() {
    this.highlighted = [];
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  draw() {
    this.clear();
    this.drawTitle();
    this.drawFretboard();
    this.drawAnnotations();
    this.drawSingles();
    this.drawBarres();
  }

  drawTitle() {
    if (this.title !== null) {
      this.ctx.font = this.titleFont;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseLine = 'middle';
      this.ctx.fillStyle = 'black';
      this.ctx.fillText(this.title, this.stringSpacing * 4, this.fretboardOriginY / 2);
    }
  }

  drawFretboard() {
    // Draw strings
    for (let i = 0; i < 6; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.fretboardOriginX + i * this.stringSpacing, this.fretboardOriginY);
      this.ctx.lineTo(this.fretboardOriginX + i * this.stringSpacing, this.fretboardOriginY + this.fretboardHeight);
      this.ctx.closePath();
      this.ctx.stroke();
    }

    // Draw the frets. One more line than there are frets, so we'll not draw a number the last time
    for (let i = 0; i <= this.nFrets + 1; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.fretboardOriginX, this.fretboardOriginY + i * this.fretSpacing);
      this.ctx.lineTo(this.fretboardOriginX + this.fretboardWidth, this.fretboardOriginY + i * this.fretSpacing);
      this.ctx.closePath();
      this.ctx.stroke();

      if (i === this.nFrets + 1) {
        break;
      }

      // And number them
      this.ctx.font = this.annotationFont;
      this.ctx.fillStyle = 'black';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText((this.startFret + i).toString(), this.stringSpacing / 2, this.fretboardOriginY + ((i + 0.5) * this.fretSpacing));
    }
  }

  drawAnnotations() {
    for (let annotationIdx in this.annotations) {
      const annotationX = this.fretboardOriginX + annotationIdx * this.stringSpacing;
      const annotationY = this.fretboardOriginY + this.fretboardHeight + this.fretSpacing * 0.5;
      this.ctx.font = this.annotationFont;
      this.ctx.fillStyle = "black";
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(this.annotations[annotationIdx], annotationX, annotationY);
    }
  }

  getSingleHitbox(single) {
    const x = this.fretboardOriginX + guitarStringToZeroOffset(single.string) * this.stringSpacing
    const y = this.fretboardOriginY + (this.fretSpacing / 2) + (single.fret - this.startFret) * this.fretSpacing
    const radius = this.stringSpacing * 0.4
    return [x, y, radius];
  }

  drawSingles() {
    // Non-barre fingers
    for (let singlesIdx in this.singles) {
      const single = this.singles[singlesIdx];

      let color;
      if (this.highlighted.some((highlighted) => highlighted.string === single.string && highlighted.fret === single.fret)) {
        color = 'red';
      } else if (!!single.isRoot) {
        color = 'white';
      } else {
        color = 'black';
      }

      const rootStyling = !!single.isRoot;
      const labelFinger = !!single.finger;

      const [singleCenterX, singleCenterY, singleRadius] = this.getSingleHitbox(single);

      this.ctx.beginPath();
      this.ctx.arc(singleCenterX, singleCenterY, singleRadius, 0, Math.PI * 2, false);
      this.ctx.fillStyle = color;
      this.ctx.fill();

      if (rootStyling) {
        this.ctx.beginPath();
        this.ctx.arc(singleCenterX, singleCenterY, singleRadius, 0, Math.PI * 2, false);
        this.ctx.strokeStyle = "black";
        this.ctx.stroke();
      }

      if (labelFinger) {
        this.ctx.font = this.fingerNumberFont;
        this.ctx.fillStyle = rootStyling ? "black" : "white";
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(single.finger.toString(), singleCenterX, singleCenterY);
      }
    }
  }

  drawBarres() {
    for (let barresIdx in this.barres) {
      const barre = this.barres[barresIdx];
      const labelFinger = !!barre.finger;

      const barreStartCenterX = this.fretboardOriginX + guitarStringToZeroOffset(barre.startString) * this.stringSpacing;
      const barreCenterY = this.fretboardOriginY + (this.fretSpacing / 2) + (barre.fret - this.startFret) * this.fretSpacing;
      const barreRadius = this.stringSpacing * 0.4;
      const barreWidth = barre.startString - barre.endString; // Because reversed naming convention

      this.ctx.beginPath();
      this.ctx.fillStyle = 'black';
      this.ctx.arc(barreStartCenterX, barreCenterY, barreRadius, Math.PI / 2, -Math.PI / 2, false);
      this.ctx.arc(barreStartCenterX + barreWidth * this.stringSpacing, barreCenterY, barreRadius, -Math.PI / 2, Math.PI / 2);
      this.ctx.fill();

      if (labelFinger) {
        this.ctx.font = this.fingerNumberFont;
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(barre.finger.toString(), barreStartCenterX + (barreWidth * this.stringSpacing / 2), barreCenterY);
      }
    }
  }
}

const GuitarFingering = (props) => {
  const canvasRef = React.useRef(null, [props.chord]);

  const stringSpacing = props.width / 7;
  const fretSpacing = (stringSpacing * 5) / 4;
  const chord = props.chord;
  const annotations = props.annotations || props.chord.annotations || ["", "", "", "", "", ""];
  const title = props.title || null;
  const onClick = props.onClick || (() => {});
  const onMouseOverNote = props.onMouseOverNote || ((note) => {});

  const allFrets = [...(chord.singles || []), ...(chord.barres || [])].map((x) => x.fret);

  // Leave a 1 fret buffer on either side
  const startFret = Math.min(...allFrets) - 1;
  const endFret = Math.max(...allFrets) + 1;
  const height = fretSpacing * ((endFret - startFret) + 3); // 1 for annotation on each side, and one for extra render

  useEffect(() => {
    const canvas = canvasRef.current;
    const chart = new FingeringChart(canvas, stringSpacing, fretSpacing, startFret, endFret, chord.singles, chord.barres, annotations, title);
    chart.draw();

    let lastMatch = null;

    const mouseDownListener = onClick;
    const mouseMoveListener = (event) => {
      const hits = chart.getOverlappingHitboxes(event.offsetX, event.offsetY);

      const match = hits.length > 0;

      if (match && !lastMatch) {
        onMouseOverNote(hits[0]);
        chart.highlight(hits[0].string, hits[0].fret);
        chart.draw();
      }

      if (!match && lastMatch) {
        chart.unhighlight();
        chart.draw();
      }

      lastMatch = match;
    }

    canvas.addEventListener('mousedown', mouseDownListener);
    canvas.addEventListener('mousemove', mouseMoveListener);

    return () => {
      canvas.removeEventListener('mousedown', mouseDownListener);
      canvas.removeEventListener('mousemove', mouseMoveListener);
    }

    // eslint-disable-next-line
  }, [props.chord]);

  return (
    <div>
      <canvas ref={canvasRef} width={props.width} height={height}/>
    </div>
  );
};

export default GuitarFingering;