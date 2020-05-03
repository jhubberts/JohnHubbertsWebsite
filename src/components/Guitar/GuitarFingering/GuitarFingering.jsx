import React, {useEffect} from "react";

const guitarStringToZeroOffset = (stringNum) => {
  return 6 - stringNum;
};

const drawFingeringChart = (ctx, stringSpacing, fretSpacing, startFret, endFret, singles, barres, annotations, title) => {
  const fretboardOriginX = stringSpacing * 1.5;
  const fretboardOriginY = fretSpacing; // Leave room for annotations

  const fretboardWidth = stringSpacing * 5; // 6 strings = 5 gaps between strings
  const nFrets = (endFret - startFret);
  const fretboardHeight = fretSpacing * (nFrets + 1);

  const titleFontSize = stringSpacing * 0.8
  const titleFont = `bold ${titleFontSize}px Arial`;

  const fingerNumberFontSize = stringSpacing * 0.5;
  const fingerNumberFont = `bold ${fingerNumberFontSize}px Arial`;
  const annotationFontSize = stringSpacing * 0.35;
  const annotationFont = `${annotationFontSize}px Arial`;

  // Draw title if any
  if (title !== null) {
    ctx.font = titleFont;
    ctx.textAlign = 'center';
    ctx.textBaseLine = 'middle';
    ctx.fillStyle = 'black';
    ctx.fillText(title, stringSpacing * 4, fretboardOriginY / 2);
  }

  // Draw strings
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(fretboardOriginX + i * stringSpacing, fretboardOriginY);
    ctx.lineTo(fretboardOriginX + i * stringSpacing, fretboardOriginY + fretboardHeight);
    ctx.closePath();
    ctx.stroke();
  }

  // Draw the frets. One more line than there are frets, so we'll not draw a number the last time
  for (let i = 0; i <= nFrets + 1; i++) {
    ctx.beginPath();
    ctx.moveTo(fretboardOriginX, fretboardOriginY + i * fretSpacing);
    ctx.lineTo(fretboardOriginX + fretboardWidth, fretboardOriginY + i * fretSpacing);
    ctx.closePath();
    ctx.stroke();

    if (i === nFrets + 1) {
      break;
    }

    // And number them
    ctx.font = annotationFont;
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText((startFret + i).toString(), stringSpacing / 2, fretboardOriginY + ((i + 0.5) * fretSpacing));
  }

  // Non-barre fingers
  for (let singlesIdx in singles) {
    const single = singles[singlesIdx];
    const rootStyling = !!single.isRoot;
    const labelFinger = !!single.finger;

    const singleCenterX = fretboardOriginX + guitarStringToZeroOffset(single.string) * stringSpacing;
    const singleCenterY = fretboardOriginY + (fretSpacing / 2) + (single.fret - startFret) * fretSpacing;
    const singleRadius = stringSpacing * 0.4;

    ctx.beginPath();
    ctx.arc(singleCenterX, singleCenterY, singleRadius, 0, Math.PI * 2, false);
    ctx.fillStyle = rootStyling ? "white" : "black";
    ctx.fill();

    if (rootStyling) {
      ctx.beginPath();
      ctx.arc(singleCenterX, singleCenterY, singleRadius, 0, Math.PI * 2, false);
      ctx.strokeStyle = "black";
      ctx.stroke();
    }

    if (labelFinger) {
      ctx.font = fingerNumberFont;
      ctx.fillStyle = rootStyling ? "black" : "white";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(single.finger.toString(), singleCenterX, singleCenterY);
    }
  }

  for (let barresIdx in barres) {
    const barre = barres[barresIdx];
    const labelFinger = !!barre.finger;

    const barreStartCenterX = fretboardOriginX  + guitarStringToZeroOffset(barre.startString) * stringSpacing;
    const barreCenterY = fretboardOriginY + (fretSpacing / 2) + (barre.fret - startFret) * fretSpacing;
    const barreRadius = stringSpacing * 0.4;
    const barreWidth = barre.startString - barre.endString; // Because reversed naming convention

    ctx.beginPath();
    ctx.fillStyle = 'black';
    ctx.arc(barreStartCenterX, barreCenterY, barreRadius, Math.PI / 2, -Math.PI / 2, false);
    ctx.arc(barreStartCenterX + barreWidth * stringSpacing, barreCenterY, barreRadius, -Math.PI / 2, Math.PI / 2);
    ctx.fill();

    if (labelFinger) {
      ctx.font = fingerNumberFont;
      ctx.fillStyle = "white";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(barre.finger.toString(), barreStartCenterX + (barreWidth * stringSpacing / 2), barreCenterY);
    }
  }

  for (let annotationIdx in annotations) {
    const annotationX = fretboardOriginX + annotationIdx * stringSpacing;
    const annotationY = fretboardOriginY + fretboardHeight + fretSpacing * 0.5;
    ctx.font = annotationFont;
    ctx.fillStyle = "black";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(annotations[annotationIdx], annotationX, annotationY);
  }
};

const GuitarFingering = (props) => {
  const canvasRef = React.useRef(null, [props.chord]);

  const stringSpacing = props.width / 7;
  const fretSpacing = (stringSpacing * 5) / 4;
  const chord = props.chord;
  const annotations = props.annotations || props.chord.annotations || ["", "", "", "", "", ""];
  const title = props.title || null;
  const onClick = props.onClick || (() => {});

  let startFret = 1000;
  let endFret = -1;

  if (chord.singles) {
    chord.singles.forEach((single) => {
      if (single.fret < startFret) {
        startFret = single.fret
      }

      if (single.fret > endFret) {
        endFret = single.fret
      }
    })
  }

  if (chord.barres) {
    chord.barres.forEach((barre) => {
      if (barre.fret < startFret) {
        startFret = barre.fret
      }

      if (barre.fret > endFret) {
        endFret = barre.fret
      }
    })
  }

  startFret -= 1;
  endFret += 1;

  const height = fretSpacing * ((endFret - startFret) + 3); // 1 for annotation on each side, and one for extra render

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.addEventListener('mousedown', onClick);
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawFingeringChart(ctx, stringSpacing, fretSpacing, startFret, endFret, chord.singles, chord.barres, annotations, title);
    // eslint-disable-next-line
  }, [props.chord]);

  return (
    <div>
      <canvas ref={canvasRef} width={props.width} height={height}/>
    </div>
  );
};

export default GuitarFingering;