"use client";

import { useState } from "react";
import {
  P5Canvas,
  type P5CanvasInstance,
  type Sketch,
  type SketchProps,
} from "@p5-wrapper/react";

type SpringProps = SketchProps & {
  k: number;
  mass: number;
};

const G = 9.82;
const W = 560;
const H = 540;
const ANCHOR_X = W / 2;
const CEILING_Y = 18;
const SPRING_TOP = 25;
const NATURAL_PX = 90;
const SCALE = 350;

const sketch: Sketch<SpringProps> = (p5) => {
  let k = 5;
  let mass = 0.05;
  let x = (mass * G) / k;
  let v = 0;
  p5.setup = () => {
    p5.createCanvas(W, H);
  };

  p5.updateWithProps = (props) => {
    if (props.k !== undefined) k = props.k;
    if (props.mass !== undefined) mass = props.mass;
  };

  p5.draw = () => {
    const mPhys = Math.max(mass, 1e-3);
    const omega = Math.sqrt(k / mPhys);
    const c = 2 * mPhys * omega * 0.18;
    let dt = p5.deltaTime / 1000;
    if (!Number.isFinite(dt) || dt <= 0) dt = 1 / 60;
    dt = Math.min(dt, 0.033);
    const sub = 4;
    const h = dt / sub;
    for (let i = 0; i < sub; i++) {
      const a = G - (k / mPhys) * x - (c / mPhys) * v;
      v += a * h;
      x += v * h;
    }

    p5.background(248, 250, 252);

    drawCeiling(p5);
    drawRuler(p5);

    const radius = 18 + Math.cbrt(Math.max(mass, 1e-3)) * 18;
    const maxStretchPx = H - 30 - radius * 2 - SPRING_TOP - NATURAL_PX;
    const stretchPx = Math.max(
      Math.min(x * SCALE, maxStretchPx),
      -NATURAL_PX * 0.5,
    );
    const springBottom = SPRING_TOP + NATURAL_PX + stretchPx;
    drawSpring(p5, ANCHOR_X, SPRING_TOP, springBottom);

    // natural-length reference line
    const naturalY = SPRING_TOP + NATURAL_PX;
    (p5.drawingContext as CanvasRenderingContext2D).setLineDash([4, 4]);
    p5.stroke(148, 163, 184);
    p5.strokeWeight(1);
    p5.line(ANCHOR_X - 110, naturalY, ANCHOR_X + 110, naturalY);
    (p5.drawingContext as CanvasRenderingContext2D).setLineDash([]);
    p5.noStroke();
    p5.fill(100, 116, 139);
    p5.textSize(11);
    p5.textAlign(p5.LEFT, p5.CENTER);
    p5.text("Ligevægtsposition", ANCHOR_X + 116, naturalY);

    // mass
    const massY = springBottom + radius;

    p5.noStroke();
    p5.fill(15, 23, 42, 28);
    p5.ellipse(ANCHOR_X, massY + radius + 6, radius * 1.9, 6);

    p5.fill(2, 132, 199);
    p5.circle(ANCHOR_X, massY, radius * 2);
    p5.fill(125, 211, 252, 180);
    p5.circle(ANCHOR_X - radius * 0.32, massY - radius * 0.32, radius * 0.85);
    p5.noStroke();
    p5.fill(255);
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.textSize(13);
    p5.textStyle(p5.BOLD);
    p5.text(`${mass.toFixed(2)} kg`, ANCHOR_X, massY);
    p5.textStyle(p5.NORMAL);

    // force arrows next to the mass — fixed scale so both arrows are
    // directly comparable, and the gravity arrow grows linearly with mass.
    const arrowX = ANCHOR_X + radius + 26;
    const Fspring = k * x;
    const Fg = mass * G;
    const FG_MAX = 0.1 * G; // largest gravity force the slider can produce
    const FG_AT_MAX_PX = 100; // visual length of F_t when mass is at slider max
    const pxPerN = FG_AT_MAX_PX / FG_MAX;
    const FspringPx = Fspring * pxPerN;
    const FgPx = Fg * pxPerN;

    drawForceArrow(
      p5,
      arrowX,
      massY - radius * 0.4,
      -FspringPx,
      [220, 38, 38],
      "F",
      "fj",
    );
    drawForceArrow(
      p5,
      arrowX,
      massY + radius * 0.4,
      FgPx,
      [15, 23, 42],
      "F",
      "t",
    );

    // extension indicator on the left
    drawExtensionMarker(p5, naturalY, springBottom, x);
  };
};

function drawCeiling(p5: P5CanvasInstance<SpringProps>) {
  p5.noStroke();
  p5.fill(71, 85, 105);
  p5.rect(ANCHOR_X - 110, CEILING_Y, 220, 8);
  p5.stroke(71, 85, 105);
  p5.strokeWeight(1);
  for (let i = -100; i <= 100; i += 14) {
    p5.line(
      ANCHOR_X + i,
      CEILING_Y,
      ANCHOR_X + i + 8,
      CEILING_Y - 8,
    );
  }
}

function drawSpring(
  p5: P5CanvasInstance<SpringProps>,
  cx: number,
  top: number,
  bottom: number,
) {
  const len = bottom - top;
  p5.stroke(15, 118, 110);
  p5.strokeWeight(2.8);
  p5.noFill();
  if (len < 30) {
    p5.line(cx, top, cx, bottom);
    return;
  }
  const coils = 10;
  const coilW = 22;
  const handle = 12;
  const handleTop = top + handle;
  const handleBottom = bottom - handle;
  const segs = coils * 2;
  const segLen = (handleBottom - handleTop) / segs;

  p5.beginShape();
  p5.vertex(cx, top);
  p5.vertex(cx, handleTop);
  for (let i = 0; i < segs; i++) {
    const y = handleTop + segLen * (i + 0.5);
    const xv = cx + (i % 2 === 0 ? coilW : -coilW);
    p5.vertex(xv, y);
  }
  p5.vertex(cx, handleBottom);
  p5.vertex(cx, bottom);
  p5.endShape();
}

function drawForceArrow(
  p5: P5CanvasInstance<SpringProps>,
  x: number,
  y: number,
  dy: number,
  rgb: [number, number, number],
  main: string,
  sub: string,
) {
  if (Math.abs(dy) < 4) return;
  const dir = Math.sign(dy);
  p5.stroke(rgb[0], rgb[1], rgb[2]);
  p5.strokeWeight(2.5);
  p5.line(x, y, x, y + dy);
  p5.noStroke();
  p5.fill(rgb[0], rgb[1], rgb[2]);
  p5.triangle(
    x,
    y + dy,
    x - 5,
    y + dy - dir * 8,
    x + 5,
    y + dy - dir * 8,
  );
  const labelX = x + 9;
  const labelY = y + dy / 2;
  p5.textAlign(p5.LEFT, p5.CENTER);
  p5.textStyle(p5.ITALIC);
  p5.textSize(12);
  p5.text(main, labelX, labelY);
  const mainW = p5.textWidth(main);
  p5.textStyle(p5.NORMAL);
  p5.textSize(9);
  p5.text(sub, labelX + mainW + 1, labelY + 4);
}

function drawRuler(p5: P5CanvasInstance<SpringProps>) {
  const x = 70;
  const yTop = SPRING_TOP - 4;
  const yBottom = H - 30;
  p5.stroke(148, 163, 184);
  p5.strokeWeight(1);
  p5.line(x, yTop, x, yBottom);

  const naturalY = SPRING_TOP + NATURAL_PX;
  const cmStep = 5;
  const pxPerCm = SCALE / 100;
  const stepPx = cmStep * pxPerCm;

  p5.fill(100, 116, 139);
  p5.textSize(10);
  p5.textAlign(p5.RIGHT, p5.CENTER);
  for (let i = -2; i < 30; i++) {
    const tickY = naturalY + i * stepPx;
    if (tickY < yTop || tickY > yBottom) continue;
    p5.stroke(148, 163, 184);
    const long = i === 0;
    p5.line(x - (long ? 8 : 5), tickY, x + (long ? 8 : 5), tickY);
    p5.noStroke();
    if (i % 2 === 0) p5.text(`${i * cmStep}`, x - 10, tickY);
  }
  p5.noStroke();
  p5.textAlign(p5.CENTER, p5.BOTTOM);
  p5.text("cm", x, yTop - 4);
}

function drawExtensionMarker(
  p5: P5CanvasInstance<SpringProps>,
  naturalY: number,
  bottomY: number,
  xMeters: number,
) {
  const xMark = 130;
  const top = Math.min(naturalY, bottomY);
  const bot = Math.max(naturalY, bottomY);
  if (Math.abs(bot - top) < 4) return;
  p5.stroke(217, 70, 239);
  p5.strokeWeight(2);
  p5.line(xMark, top, xMark, bot);
  // small caps
  p5.line(xMark - 5, top, xMark + 5, top);
  p5.line(xMark - 5, bot, xMark + 5, bot);
  p5.noStroke();
  p5.fill(162, 28, 175);
  p5.textAlign(p5.LEFT, p5.CENTER);
  p5.textSize(12);
  p5.textStyle(p5.BOLD);
  p5.text(`x = ${(xMeters * 100).toFixed(1)} cm`, xMark + 10, (top + bot) / 2);
  p5.textStyle(p5.NORMAL);
}

export default function HookesLov() {
  const [k, setK] = useState(5);
  const [mass, setMass] = useState(0.05);

  const xEq = (mass * G) / k;
  const fEq = mass * G;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white [&_canvas]:block [&_canvas]:h-auto [&_canvas]:max-w-full [&_canvas:not(:last-of-type)]:hidden">
        <P5Canvas sketch={sketch} k={k} mass={mass} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat symbol="k" label="Fjederkonstant" value={`${k.toFixed(1)} N/m`} />
        <Stat symbol="m" label="Masse" value={`${mass.toFixed(2)} kg`} />
        <Stat
          symbol="x"
          label="Forlængelse"
          value={`${(xEq * 100).toFixed(1)} cm`}
        />
        <Stat
          symbol="F"
          label="Fjederkraft"
          value={`${fEq.toFixed(2)} N`}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
        <SliderField
          label="Fjederkonstant k"
          unit="N/m"
          value={k}
          min={0.1}
          max={10}
          step={0.1}
          decimals={1}
          onChange={setK}
        />
        <SliderField
          label="Masse m"
          unit="kg"
          value={mass}
          min={0}
          max={0.1}
          step={0.01}
          decimals={2}
          onChange={setMass}
        />
      </div>
    </div>
  );
}

function Stat({
  symbol,
  label,
  value,
}: {
  symbol: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="flex items-baseline gap-2">
        <span className="font-serif text-lg italic text-slate-500">
          {symbol}
        </span>
        <span className="text-xs uppercase tracking-wider text-slate-500">
          {label}
        </span>
      </div>
      <div className="mt-1 font-mono text-lg font-semibold text-sky-700">
        {value}
      </div>
    </div>
  );
}

function SliderField({
  label,
  unit,
  value,
  min,
  max,
  step,
  decimals,
  onChange,
}: {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  decimals: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="font-mono text-sm font-semibold text-sky-700">
          {value.toFixed(decimals)} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-sky-600"
      />
      <div className="mt-1 flex justify-between text-xs text-slate-400">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </label>
  );
}
