# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Eksperiment Laboratorie — a Danish-language Next.js site of physics labs for HTX Fysik A. Each "lab" pairs theory with an interactive p5.js simulation that students explore via sliders. All UI copy is in Danish; keep new content in Danish unless asked otherwise.

## Commands

- `npm run dev` — start the Next.js dev server (default port 3000)
- `npm run build` / `npm start` — production build + serve
- `npm run lint` — `next lint`

There is no test runner configured.

A preview launch config is committed at `.claude/launch.json` (named `next-dev`); use it with the preview tooling instead of running `next dev` via Bash.

## Architecture

### Content model

The entire content tree (topics → labs → theory/observations) lives in [src/content/topics.ts](src/content/topics.ts), typed by [src/content/types.ts](src/content/types.ts). To add a lab, add an entry under the right `Topic.labs[]`; to add a topic, add a new `Topic` to the array. Pages are statically generated from this data — there is no CMS.

Each `Lab` has optional `goal`, `keyConcepts`, `keyEquation`, `theory`, `observations`, `simulationId`. The lab page conditionally renders sections per field, so a stub lab (just `slug`/`title`/`shortDescription`) renders an "Under udarbejdelse" placeholder.

### Routing

- `/` — landing page, lists topics
- `/emner/[topic]` — topic page, lists labs
- `/emner/[topic]/[lab]` — lab page, renders content sections + simulation

Both dynamic routes use `generateStaticParams` over `getAllTopics()`, so the whole site pre-renders at build time. `getTopic` / `getLab` in [src/lib/content.ts](src/lib/content.ts) are the lookup helpers.

### Simulations

Simulations are React client components living in `src/components/sims/`. The router-side flow:

1. The lab data references a sim by string id (`Lab.simulationId`).
2. [src/components/Simulation.tsx](src/components/Simulation.tsx) maps each id to a `next/dynamic` import with `ssr: false` and a shared `SimulationLoading` fallback. **A new sim must be registered here** or the lab page falls back to a "kommer her" placeholder.
3. The sim component itself is `"use client"`, owns the slider React state, and renders a `<P5Canvas>` from `@p5-wrapper/react` plus a stat row and slider panel. [src/components/sims/HookesLov.tsx](src/components/sims/HookesLov.tsx) is the cleanest reference; `SkraatKast.tsx` is the older variant.

### p5 sketch conventions

Sketches use the instance-mode pattern from `@p5-wrapper/react` v5:

```tsx
const sketch: Sketch<MyProps> = (p5) => {
  let foo = defaultFoo;          // closure state
  p5.setup = () => p5.createCanvas(W, H);
  p5.updateWithProps = (props) => { if (props.foo !== undefined) foo = props.foo; };
  p5.draw = () => { /* ... */ };
};
```

The sketch must be defined **outside the component** (module-level) so the wrapper's prop-diff memoization works; redefining it inside the component creates a new sketch reference every render and tears down the canvas.

Slider values flow `React state → P5Canvas props → updateWithProps → closure variables → draw`. Don't try to stream live readouts back from the sketch into React state on every frame — that flickers. Compute displayed equilibrium values directly from the React state in the parent component.

### Two known quirks

1. **Ghost canvas under React StrictMode (dev only).** The `@p5-wrapper/react` v5 effect calls `p5.remove()` (async) without awaiting and doesn't return a cleanup, so StrictMode's double-invoke leaves an extra orphaned canvas in the DOM. Workaround: every sim wraps `<P5Canvas>` in a `<div>` carrying `[&_canvas:not(:last-of-type)]:hidden` to hide the ghost. Keep that class on any new sim wrapper.
2. **`requestAnimationFrame` doesn't fire in the headless preview tool.** `p5.draw` only runs when called manually in that environment, so the spring/ball won't animate in preview screenshots. The code is fine; verify in a real browser. `setup`, `updateWithProps`, and slider→state wiring all *do* work in the preview.

### Styling

Tailwind v4 (CSS-first, configured via PostCSS — no `tailwind.config.ts`). Topic colors are centralized in [src/lib/accent.ts](src/lib/accent.ts): each `AccentColor` maps to a bundle of Tailwind classes (`bg`, `bgSoft`, `text`, `border`, …). When writing a new topic, pick from the existing six palette names rather than inventing new colors. Topic/lab pages and cards consume the bundle via `getAccent(topic.accentColor)`.

### Lab page rendering

[src/app/emner/\[topic\]/\[lab\]/page.tsx](src/app/emner/[topic]/[lab]/page.tsx) is the single template that renders every lab. New optional fields on `Lab` should be added to `types.ts` and rendered conditionally here, following the existing pattern (`{lab.x ? <section>…</section> : null}`). Equation rendering uses an in-file `renderEquation` helper that italicizes single-letter tokens — no KaTeX/MathJax dependency.
