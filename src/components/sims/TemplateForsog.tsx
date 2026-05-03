"use client";

import {
  type P5CanvasInstance,
  type Sketch,
  type SketchProps,
} from "@p5-wrapper/react";
import { SimulationFrame } from "./SimulationFrame";

// LAB PARAMETERS — edit these before a lab.
// Drawing constants live below; keep them as-is unless adjusting the canvas layout.
const LAB_CONFIG = {
  // Tyngdeacceleration (m/s²)
  g: 9.82,

  // Massevælger (slider) — værdier i kg
  mass: {
    label: "Masse",
    symbol: "m",
    unit: "kg",
    min: 0,
    max: 0.100,
    step: 0.001,
    decimals: 3,
    default: 0.0,
  },

  // Dynamometer (dropdown) — værdier i N
  dynamometer: {
    label: "Dynamometer",
    options: [0.1, 0.5, 1, 2, 5, 10, 50],
    default: 50,
  },

  // Stat-bokse vist under kanvasset
  stats: {
    mass: { label: "Masse", symbol: "m" },
    g: { label: "Tyngdeacc.", symbol: "g" },
    force: { label: "Tyngdekraft", symbol: "F_t" },
  },
};

type TemplateProps = SketchProps & {
  massKg: number;
  dynMaxN: number;
};

const W = 480;
const H = 460;
const G = LAB_CONFIG.g;
const BRACKET_Y = 30;
const METER_TOP = 50;
const METER_H = 320;
const METER_W = 76;
const HOOK_LEN = 24;

const sketch: Sketch<TemplateProps> = (p5) => {
  let massKg = 0.2;
  let dynMaxN = 2;

  p5.setup = () => {
    p5.createCanvas(W, H);
  };

  p5.updateWithProps = (props) => {
    if (props.massKg !== undefined) massKg = props.massKg;
    if (props.dynMaxN !== undefined) dynMaxN = props.dynMaxN;
  };

  p5.draw = () => {
    p5.background(248, 250, 252);

    drawBracket(p5);
    drawDynamometer(p5, massKg, dynMaxN);

    const meterBottom = METER_TOP + METER_H;
    const hookTop = meterBottom;
    const hookBottom = hookTop + HOOK_LEN;
    drawHook(p5, hookTop, hookBottom);

    drawWeight(p5, hookBottom, massKg);
  };
};

function getTickConfig(maxN: number) {
  // identical layout for every range: 5 major intervals + 4 subticks per major.
  // The labels differ — that's the point: a more sensitive meter buys precision, not more marks.
  const major = maxN / 5;
  const minor = major / 5;
  const decimals = major >= 1 ? 0 : major >= 0.1 ? 1 : major >= 0.01 ? 2 : 3;
  return { minor, major, decimals };
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
  massKg: number,
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

  // unit label centered in the top cap
  p5.noStroke();
  p5.fill(255);
  p5.textSize(14);
  p5.textStyle(p5.BOLD);
  p5.textAlign(p5.CENTER, p5.CENTER);
  p5.text("N", cx, top + capH / 2);
  p5.textStyle(p5.NORMAL);

  // pointer indicator (red disc) — clamped to scale range
  const force = massKg * G;
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
  massKg: number,
) {
  const cx = W / 2;
  // weight stack: one block per 0.1 kg (rounded), capped visually
  const blocks = Math.ceil(massKg * 10);
  const visibleBlocks = Math.min(blocks, 10);
  const blockH = 36;
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

  // mass label on the stack — only when there are blocks to label
  if (visibleBlocks > 0) {
    p5.noStroke();
    p5.fill(255);
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.textStyle(p5.BOLD);
    p5.textSize(13);
    p5.text(
      `${formatDanish(massKg, LAB_CONFIG.mass.decimals)} ${LAB_CONFIG.mass.unit}`,
      cx,
      stackTop + (visibleBlocks * blockH) / 2,
    );
  }
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


const sliders = [
  {
    key: "massKg",
    label: LAB_CONFIG.mass.label,
    symbol: LAB_CONFIG.mass.symbol,
    unit: LAB_CONFIG.mass.unit,
    min: LAB_CONFIG.mass.min,
    max: LAB_CONFIG.mass.max,
    step: LAB_CONFIG.mass.step,
    decimals: LAB_CONFIG.mass.decimals,
    default: LAB_CONFIG.mass.default,
  },
];

const selects = [
  {
    key: "dynMaxN",
    label: LAB_CONFIG.dynamometer.label,
    options: LAB_CONFIG.dynamometer.options.map((value) => ({
      value,
      label: `${value < 1 ? formatDanish(value, 1) : value} N`,
    })),
    default: LAB_CONFIG.dynamometer.default,
  },
];

export default function TemplateForsog() {
  return (
    <SimulationFrame<TemplateProps>
      sketch={sketch}
      sliders={sliders}
      selects={selects}
      buildSketchProps={(v) => ({
        massKg: v.massKg,
        dynMaxN: v.dynMaxN,
      })}
      stats={(v) => {
        const force = v.massKg * G;
        return [
          {
            ...LAB_CONFIG.stats.mass,
            value: `${v.massKg.toFixed(LAB_CONFIG.mass.decimals)} ${LAB_CONFIG.mass.unit}`,
          },
          { ...LAB_CONFIG.stats.g, value: `${G.toFixed(2)} m/s²` },
          { ...LAB_CONFIG.stats.force, value: `${force.toFixed(2)} N` },
        ];
      }}
    />
  );
}
