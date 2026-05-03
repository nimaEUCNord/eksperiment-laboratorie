"use client";

import {
  type P5CanvasInstance,
  type Sketch,
  type SketchProps,
} from "@p5-wrapper/react";
import { SimulationFrame } from "./SimulationFrame";

type TemplateProps = SketchProps & {
  massGrams: number;
  dynMaxN: number;
};

const W = 480;
const H = 460;
const G = 9.82;
const BRACKET_Y = 30;
const METER_TOP = 50;
const METER_H = 170;
const METER_W = 76;
const HOOK_LEN = 24;

const sketch: Sketch<TemplateProps> = (p5) => {
  let massGrams = 10;
  let dynMaxN = 2;

  p5.setup = () => {
    p5.createCanvas(W, H);
  };

  p5.updateWithProps = (props) => {
    if (props.massGrams !== undefined) massGrams = props.massGrams;
    if (props.dynMaxN !== undefined) dynMaxN = props.dynMaxN;
  };

  p5.draw = () => {
    p5.background(248, 250, 252);

    drawBracket(p5);
    drawDynamometer(p5, massGrams, dynMaxN);

    const meterBottom = METER_TOP + METER_H;
    const hookTop = meterBottom;
    const hookBottom = hookTop + HOOK_LEN;
    drawHook(p5, hookTop, hookBottom);

    drawWeight(p5, hookBottom, massGrams);

    drawForceArrow(p5, hookBottom, massGrams, dynMaxN);
  };
};

function getTickConfig(maxN: number) {
  if (maxN <= 0.1) return { minor: 0.01, major: 0.05, decimals: 2 };
  if (maxN <= 0.5) return { minor: 0.05, major: 0.1, decimals: 1 };
  if (maxN <= 1) return { minor: 0.1, major: 0.5, decimals: 1 };
  if (maxN <= 2) return { minor: 0.2, major: 1, decimals: 0 };
  if (maxN <= 5) return { minor: 0.5, major: 1, decimals: 0 };
  if (maxN <= 10) return { minor: 1, major: 5, decimals: 0 };
  return { minor: 5, major: 10, decimals: 0 };
}

function formatDanish(n: number, decimals: number) {
  return n.toFixed(decimals).replace(".", ",");
}

function drawBracket(p5: P5CanvasInstance<TemplateProps>) {
  p5.noStroke();
  p5.fill(71, 85, 105);
  p5.rect(W / 2 - 110, BRACKET_Y, 220, 8);
  p5.stroke(71, 85, 105);
  p5.strokeWeight(1);
  for (let i = -100; i <= 100; i += 14) {
    p5.line(W / 2 + i, BRACKET_Y, W / 2 + i + 8, BRACKET_Y - 8);
  }
  // suspension cord from bracket to meter
  p5.stroke(100, 116, 139);
  p5.strokeWeight(1.5);
  p5.line(W / 2, BRACKET_Y + 8, W / 2, METER_TOP);
}

function drawDynamometer(
  p5: P5CanvasInstance<TemplateProps>,
  massGrams: number,
  dynMaxN: number,
) {
  const cx = W / 2;
  const top = METER_TOP;
  const left = cx - METER_W / 2;
  const right = cx + METER_W / 2;
  const bottom = top + METER_H;

  // top cap (where the suspension ring attaches)
  const capH = 16;
  p5.noStroke();
  p5.fill(71, 85, 105);
  p5.rect(left - 4, top, METER_W + 8, capH, 6, 6, 2, 2);

  // suspension ring at the very top of the cap
  p5.stroke(71, 85, 105);
  p5.strokeWeight(2);
  p5.noFill();
  p5.ellipse(cx, top - 5, 12, 10);

  // tube body — pale plastic with subtle highlight
  p5.noStroke();
  p5.fill(241, 245, 249);
  p5.rect(left, top + capH, METER_W, METER_H - capH * 2, 2);
  // glossy highlight strip on the left edge
  p5.fill(255, 255, 255, 180);
  p5.rect(left + 4, top + capH + 4, 6, METER_H - capH * 2 - 8, 2);

  // bottom cap
  p5.fill(71, 85, 105);
  p5.rect(left - 4, bottom - capH, METER_W + 8, capH, 2, 2, 6, 6);

  // scale region (within the body)
  const scaleTop = top + capH + 10;
  const scaleBottom = bottom - capH - 10;
  const scaleLen = scaleBottom - scaleTop;
  const tickX = cx + 8;

  // central guide rail (where the indicator slides)
  p5.stroke(203, 213, 225);
  p5.strokeWeight(1);
  p5.line(cx, scaleTop, cx, scaleBottom);

  // ticks: spacing scales with the chosen meter range
  const ticks = getTickConfig(dynMaxN);
  const numMinor = Math.round(dynMaxN / ticks.minor);
  p5.textAlign(p5.LEFT, p5.CENTER);
  p5.textFont("sans-serif");
  for (let i = 0; i <= numMinor; i++) {
    const n = i * ticks.minor;
    const y = scaleTop + (n / dynMaxN) * scaleLen;
    const major =
      Math.abs(n / ticks.major - Math.round(n / ticks.major)) < 0.001;
    p5.stroke(71, 85, 105);
    p5.strokeWeight(major ? 1.5 : 1);
    const len = major ? 10 : 5;
    p5.line(tickX, y, tickX + len, y);
    if (major) {
      p5.noStroke();
      p5.fill(51, 65, 85);
      p5.textSize(9);
      p5.text(formatDanish(n, ticks.decimals), tickX + len + 2, y + 0.5);
    }
  }

  // unit label near the top of the scale
  p5.noStroke();
  p5.fill(100, 116, 139);
  p5.textSize(9);
  p5.textAlign(p5.LEFT, p5.BOTTOM);
  p5.text("N", tickX + 12, scaleTop - 2);

  // pointer indicator (red disc) — clamped to scale range
  const force = (massGrams / 1000) * G;
  const clamped = Math.min(force, dynMaxN);
  const overflow = force > dynMaxN;
  const pointerY = scaleTop + (clamped / dynMaxN) * scaleLen;

  p5.fill(220, 38, 38);
  p5.noStroke();
  // arrow-shaped indicator pointing right at the scale
  p5.triangle(
    cx - 14,
    pointerY - 6,
    cx - 14,
    pointerY + 6,
    cx - 2,
    pointerY,
  );
  p5.rect(cx - 24, pointerY - 4, 12, 8, 2);

  if (overflow) {
    p5.fill(220, 38, 38);
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.textStyle(p5.BOLD);
    p5.textSize(9);
    p5.text("MAX", cx, scaleBottom + 8);
    p5.textStyle(p5.NORMAL);
  }

  // brand label on the body
  p5.fill(100, 116, 139);
  p5.textFont("sans-serif");
  p5.textSize(8);
  p5.textAlign(p5.CENTER, p5.CENTER);
  p5.textStyle(p5.BOLD);
  const rangeLabel = formatDanish(dynMaxN, dynMaxN < 1 ? 1 : 0);
  p5.text(`DYNAMOMETER ${rangeLabel} N`, cx, top + capH + 4 + 6);
  p5.textStyle(p5.NORMAL);
}

function drawHook(
  p5: P5CanvasInstance<TemplateProps>,
  top: number,
  bottom: number,
) {
  const cx = W / 2;
  p5.stroke(100, 116, 139);
  p5.strokeWeight(2.5);
  p5.noFill();
  p5.line(cx, top, cx, bottom - 6);
  p5.arc(cx, bottom - 6, 12, 12, 0, Math.PI);
}

function drawWeight(
  p5: P5CanvasInstance<TemplateProps>,
  hookBottom: number,
  massGrams: number,
) {
  const cx = W / 2;
  // weight stack: one block per 100 g (rounded), capped visually
  const blocks = Math.max(1, Math.round(massGrams / 100));
  const visibleBlocks = Math.min(blocks, 10);
  const blockH = 18;
  const blockW = 80;
  const stackTop = hookBottom + 4;

  // hanger ring
  p5.stroke(100, 116, 139);
  p5.strokeWeight(2);
  p5.noFill();
  p5.ellipse(cx, stackTop - 2, 14, 8);

  for (let i = 0; i < visibleBlocks; i++) {
    const y = stackTop + i * blockH;
    p5.noStroke();
    p5.fill(15, 23, 42, 28);
    p5.rect(cx - blockW / 2 + 2, y + blockH - 3, blockW, 4, 2);
    p5.fill(2, 132, 199);
    p5.rect(cx - blockW / 2, y, blockW, blockH, 3);
    p5.fill(125, 211, 252, 140);
    p5.rect(cx - blockW / 2 + 4, y + 3, blockW - 8, 4, 2);
  }

  // mass label on the stack
  p5.noStroke();
  p5.fill(255);
  p5.textAlign(p5.CENTER, p5.CENTER);
  p5.textStyle(p5.BOLD);
  p5.textSize(13);
  p5.text(
    `${massGrams} g`,
    cx,
    stackTop + (visibleBlocks * blockH) / 2,
  );
  p5.textStyle(p5.NORMAL);

  if (blocks > visibleBlocks) {
    p5.fill(100, 116, 139);
    p5.textSize(10);
    p5.text(
      `(+${blocks - visibleBlocks} skjult)`,
      cx,
      stackTop + visibleBlocks * blockH + 12,
    );
  }
}

function drawForceArrow(
  p5: P5CanvasInstance<TemplateProps>,
  hookBottom: number,
  massGrams: number,
  dynMaxN: number,
) {
  const cx = W / 2;
  const blocks = Math.max(1, Math.round(massGrams / 100));
  const visibleBlocks = Math.min(blocks, 10);
  const blockH = 18;
  const stackBottom = hookBottom + 4 + visibleBlocks * blockH;

  // F_t arrow downward, length scales with force
  const force = (massGrams / 1000) * G;
  const ARROW_MAX = 70;
  const arrowLen = Math.min((force / dynMaxN) * ARROW_MAX, ARROW_MAX);
  if (arrowLen < 4) return;

  const ax = cx + 80;
  const ayTop = stackBottom - 12;
  const ayBottom = ayTop + arrowLen;
  p5.stroke(15, 23, 42);
  p5.strokeWeight(2.5);
  p5.line(ax, ayTop, ax, ayBottom);
  p5.noStroke();
  p5.fill(15, 23, 42);
  p5.triangle(ax, ayBottom, ax - 5, ayBottom - 8, ax + 5, ayBottom - 8);
  p5.textAlign(p5.LEFT, p5.CENTER);
  p5.textStyle(p5.ITALIC);
  p5.textSize(12);
  p5.text("F", ax + 8, (ayTop + ayBottom) / 2);
  p5.textStyle(p5.NORMAL);
  p5.textSize(9);
  p5.text("t", ax + 16, (ayTop + ayBottom) / 2 + 4);
}

const sliders = [
  {
    key: "massGrams",
    label: "Masse m",
    unit: "g",
    min: 50,
    max: 1000,
    step: 50,
    decimals: 0,
    default: 200,
  },
];

const selects = [
  {
    key: "dynMaxN",
    label: "Dynamometer",
    options: [
      { value: 0.1, label: "0,1 N" },
      { value: 0.5, label: "0,5 N" },
      { value: 1, label: "1 N" },
      { value: 2, label: "2 N" },
      { value: 5, label: "5 N" },
      { value: 10, label: "10 N" },
      { value: 50, label: "50 N" },
    ],
    default: 2,
  },
];

export default function TemplateForsog() {
  return (
    <SimulationFrame<TemplateProps>
      sketch={sketch}
      sliders={sliders}
      selects={selects}
      buildSketchProps={(v) => ({
        massGrams: v.massGrams,
        dynMaxN: v.dynMaxN,
      })}
      stats={(v) => {
        const force = (v.massGrams / 1000) * G;
        return [
          {
            symbol: "m",
            label: "Masse",
            value: `${v.massGrams.toFixed(0)} g`,
          },
          {
            symbol: "g",
            label: "Tyngdeacc.",
            value: `${G.toFixed(2)} m/s²`,
          },
          {
            symbol: "F",
            label: "Tyngdekraft",
            value: `${force.toFixed(2)} N`,
          },
        ];
      }}
    />
  );
}
