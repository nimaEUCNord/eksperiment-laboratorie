"use client";

import { useState } from "react";
import {
  P5Canvas,
  type P5CanvasInstance,
  type Sketch,
  type SketchProps,
} from "@p5-wrapper/react";

type ProjProps = SketchProps & { angle: number; v0: number };

const G = 9.82;
const W = 720;
const H = 420;
const MARGIN_L = 50;
const MARGIN_R = 20;
const MARGIN_T = 20;
const GROUND_Y = H - 40;

const sketch: Sketch<ProjProps> = (p5) => {
  let angleDeg = 45;
  let v0 = 25;
  let t = 0;

  p5.setup = () => {
    p5.createCanvas(W, H);
  };

  p5.updateWithProps = (props) => {
    if (props.angle !== undefined && props.angle !== angleDeg) {
      angleDeg = props.angle;
      t = 0;
    }
    if (props.v0 !== undefined && props.v0 !== v0) {
      v0 = props.v0;
      t = 0;
    }
  };

  p5.draw = () => {
    const theta = (angleDeg * Math.PI) / 180;
    const vx = v0 * Math.cos(theta);
    const vy = v0 * Math.sin(theta);
    const T = (2 * vy) / G;
    const R = vx * T;
    const Hmax = (vy * vy) / (2 * G);

    const availW = W - MARGIN_L - MARGIN_R;
    const availH = GROUND_Y - MARGIN_T;
    const scale = Math.min(
      availW / Math.max(R * 1.1, 1),
      availH / Math.max(Hmax * 1.25, 1),
    );

    const ox = MARGIN_L;
    const oy = GROUND_Y;

    // Sky background
    p5.noStroke();
    p5.fill(240, 249, 255);
    p5.rect(0, 0, W, GROUND_Y);
    // Ground band
    p5.fill(226, 232, 240);
    p5.rect(0, GROUND_Y, W, H - GROUND_Y);
    p5.stroke(148, 163, 184);
    p5.strokeWeight(1);
    p5.line(0, GROUND_Y, W, GROUND_Y);

    drawAxisTicks(p5, ox, oy, scale, R, Hmax);

    // Faded full trajectory
    p5.noFill();
    p5.stroke(2, 132, 199, 90);
    p5.strokeWeight(2);
    p5.beginShape();
    const steps = 80;
    for (let i = 0; i <= steps; i++) {
      const tt = (i / steps) * T;
      const x = vx * tt;
      const y = vy * tt - 0.5 * G * tt * tt;
      p5.vertex(ox + x * scale, oy - y * scale);
    }
    p5.endShape();

    // Velocity vector at the origin
    const arrowLen = Math.min(90, 30 + v0 * 2);
    const ax = ox + Math.cos(theta) * arrowLen;
    const ay = oy - Math.sin(theta) * arrowLen;
    p5.stroke(2, 132, 199);
    p5.strokeWeight(2.5);
    p5.line(ox, oy, ax, ay);
    drawArrowHead(p5, ax, ay, theta);

    // Angle arc
    p5.noFill();
    p5.stroke(56, 189, 248);
    p5.strokeWeight(1.5);
    p5.arc(ox, oy, 44, 44, -theta, 0);
    p5.noStroke();
    p5.fill(15, 23, 42);
    p5.textSize(11);
    p5.textAlign(p5.LEFT, p5.CENTER);
    p5.text(
      `${angleDeg.toFixed(0)}°`,
      ox + 26 * Math.cos(theta / 2),
      oy - 26 * Math.sin(theta / 2),
    );

    // Advance simulation time
    const dt = p5.deltaTime / 1000;
    t += dt;
    if (t > T + 0.6) t = 0;
    const tCur = Math.min(t, T);
    const xCur = vx * tCur;
    const yCur = vy * tCur - 0.5 * G * tCur * tCur;
    const pxCur = ox + xCur * scale;
    const pyCur = oy - Math.max(yCur, 0) * scale;

    // Ball
    p5.noStroke();
    p5.fill(15, 118, 110, 80);
    p5.circle(pxCur, pyCur + 2, 14);
    p5.fill(2, 132, 199);
    p5.circle(pxCur, pyCur, 14);
    p5.fill(255, 255, 255, 140);
    p5.circle(pxCur - 3, pyCur - 3, 4);
  };
};

function drawAxisTicks(
  p5: P5CanvasInstance<ProjProps>,
  ox: number,
  oy: number,
  scale: number,
  R: number,
  Hmax: number,
) {
  p5.fill(100, 116, 139);
  p5.textSize(11);

  // X axis
  p5.textAlign(p5.CENTER, p5.TOP);
  const xStep = chooseTickStep(R);
  for (let xm = 0; xm <= R * 1.1; xm += xStep) {
    const px = ox + xm * scale;
    if (px > W - MARGIN_R) break;
    p5.stroke(203, 213, 225);
    p5.strokeWeight(1);
    p5.line(px, oy - 3, px, oy + 3);
    p5.noStroke();
    p5.text(`${xm.toFixed(0)}`, px, oy + 6);
  }

  // Y axis
  p5.textAlign(p5.RIGHT, p5.CENTER);
  const yStep = chooseTickStep(Hmax);
  for (let ym = yStep; ym <= Hmax * 1.25; ym += yStep) {
    const py = oy - ym * scale;
    if (py < MARGIN_T) break;
    p5.stroke(203, 213, 225);
    p5.strokeWeight(1);
    p5.line(ox - 3, py, ox + 3, py);
    p5.noStroke();
    p5.text(`${ym.toFixed(0)}`, ox - 6, py);
  }

  // Axis labels
  p5.textAlign(p5.RIGHT, p5.BOTTOM);
  p5.text("x [m]", W - MARGIN_R, oy - 4);
  p5.textAlign(p5.LEFT, p5.TOP);
  p5.text("y [m]", ox + 4, MARGIN_T);
}

function chooseTickStep(maxValue: number): number {
  if (maxValue <= 0) return 1;
  const raw = maxValue / 6;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  let step = 1;
  if (norm < 1.5) step = 1;
  else if (norm < 3) step = 2;
  else if (norm < 7) step = 5;
  else step = 10;
  return step * mag;
}

function drawArrowHead(
  p5: P5CanvasInstance<ProjProps>,
  x: number,
  y: number,
  theta: number,
) {
  const size = 9;
  p5.push();
  p5.translate(x, y);
  p5.rotate(-theta);
  p5.noStroke();
  p5.fill(2, 132, 199);
  p5.triangle(0, 0, -size, -size / 2, -size, size / 2);
  p5.pop();
}

export default function SkraatKast() {
  const [angle, setAngle] = useState(45);
  const [v0, setV0] = useState(25);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white [&_canvas]:block [&_canvas]:h-auto [&_canvas]:max-w-full [&_canvas:not(:last-of-type)]:hidden">
        <P5Canvas sketch={sketch} angle={angle} v0={v0} />
      </div>

      <div className="grid grid-cols-1 gap-5 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
        <SliderField
          label="Startvinkel θ"
          unit="°"
          value={angle}
          min={5}
          max={85}
          step={1}
          decimals={0}
          onChange={setAngle}
        />
        <SliderField
          label="Starthastighed v₀"
          unit="m/s"
          value={v0}
          min={5}
          max={40}
          step={0.5}
          decimals={1}
          onChange={setV0}
        />
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
