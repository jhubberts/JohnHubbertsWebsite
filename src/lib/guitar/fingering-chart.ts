import type { Single, Barre } from "./chord";

export const guitarStringToZeroOffset = (stringNum: number): number => {
  return 6 - stringNum;
};

export class FingeringChart {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  singles: Single[];
  barres: Barre[];
  annotations: string[];
  title: string | null;

  stringSpacing: number;
  fretSpacing: number;
  startFret: number;
  endFret: number;

  fretboardOriginX: number;
  fretboardOriginY: number;
  fretboardWidth: number;
  nFrets: number;
  fretboardHeight: number;

  titleFont: string;
  fingerNumberFont: string;
  annotationFont: string;

  foregroundColor: string;
  backgroundColor: string;

  hitBoxes: [[number, number, number], Single][];
  highlighted: { string: number; fret: number }[];

  constructor(
    canvas: HTMLCanvasElement,
    stringSpacing: number,
    fretSpacing: number,
    startFret: number,
    endFret: number,
    singles: Single[],
    barres: Barre[],
    annotations: string[],
    title: string | null,
    foregroundColor: string = 'black',
    backgroundColor: string = 'white',
  ) {
    this.ctx = canvas.getContext("2d")!;
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

    this.foregroundColor = foregroundColor;
    this.backgroundColor = backgroundColor;

    this.hitBoxes = this.singles.map((single) => [this.getSingleHitbox(single), single]);

    this.highlighted = [];
  }

  getOverlappingHitboxes(x: number, y: number): Single[] {
    return this.hitBoxes.filter((hitbox) => {
      const [hitX, hitY, hitRadius] = hitbox[0];

      return Math.sqrt(Math.pow(x - hitX, 2) + Math.pow(y - hitY, 2)) <= hitRadius;
    }).map((hitbox) => hitbox[1]);
  }

  highlight(string: number, fret: number): void {
    this.highlighted.push({string: string, fret: fret});
  }

  unhighlight(): void {
    this.highlighted = [];
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  draw(): void {
    this.clear();
    this.drawTitle();
    this.drawFretboard();
    this.drawAnnotations();
    this.drawSingles();
    this.drawBarres();
  }

  drawTitle(): void {
    if (this.title !== null) {
      this.ctx.font = this.titleFont;
      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = this.foregroundColor;
      this.ctx.fillText(this.title, this.stringSpacing * 4, this.fretboardOriginY / 2);
    }
  }

  drawFretboard(): void {
    // Draw strings
    this.ctx.strokeStyle = this.foregroundColor;
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
      this.ctx.fillStyle = this.foregroundColor;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText((this.startFret + i).toString(), this.stringSpacing / 2, this.fretboardOriginY + ((i + 0.5) * this.fretSpacing));
    }
  }

  drawAnnotations(): void {
    for (const annotationIdx in this.annotations) {
      const annotationX = this.fretboardOriginX + Number(annotationIdx) * this.stringSpacing;
      const annotationY = this.fretboardOriginY + this.fretboardHeight + this.fretSpacing * 0.5;
      this.ctx.font = this.annotationFont;
      this.ctx.fillStyle = this.foregroundColor;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(this.annotations[annotationIdx], annotationX, annotationY);
    }
  }

  getSingleHitbox(single: Single): [number, number, number] {
    const x = this.fretboardOriginX + guitarStringToZeroOffset(single.string) * this.stringSpacing
    const y = this.fretboardOriginY + (this.fretSpacing / 2) + (single.fret - this.startFret) * this.fretSpacing
    const radius = this.stringSpacing * 0.4
    return [x, y, radius];
  }

  drawSingles(): void {
    // Non-barre fingers
    for (const singlesIdx in this.singles) {
      const single = this.singles[singlesIdx];

      let color: string;
      if (this.highlighted.some((highlighted) => highlighted.string === single.string && highlighted.fret === single.fret)) {
        color = 'red';
      } else if (!!single.isRoot) {
        color = this.backgroundColor;
      } else {
        color = this.foregroundColor;
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
        this.ctx.strokeStyle = this.foregroundColor;
        this.ctx.stroke();
      }

      if (labelFinger) {
        this.ctx.font = this.fingerNumberFont;
        this.ctx.fillStyle = rootStyling ? this.foregroundColor : this.backgroundColor;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(single.finger!.toString(), singleCenterX, singleCenterY);
      }
    }
  }

  drawBarres(): void {
    for (const barresIdx in this.barres) {
      const barre = this.barres[barresIdx];
      const labelFinger = !!barre.finger;

      const barreStartCenterX = this.fretboardOriginX + guitarStringToZeroOffset(barre.startString) * this.stringSpacing;
      const barreCenterY = this.fretboardOriginY + (this.fretSpacing / 2) + (barre.fret - this.startFret) * this.fretSpacing;
      const barreRadius = this.stringSpacing * 0.4;
      const barreWidth = barre.startString - barre.endString; // Because reversed naming convention

      this.ctx.beginPath();
      this.ctx.fillStyle = this.foregroundColor;
      this.ctx.arc(barreStartCenterX, barreCenterY, barreRadius, Math.PI / 2, -Math.PI / 2, false);
      this.ctx.arc(barreStartCenterX + barreWidth * this.stringSpacing, barreCenterY, barreRadius, -Math.PI / 2, Math.PI / 2);
      this.ctx.fill();

      if (labelFinger) {
        this.ctx.font = this.fingerNumberFont;
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(barre.finger!.toString(), barreStartCenterX + (barreWidth * this.stringSpacing / 2), barreCenterY);
      }
    }
  }
}
