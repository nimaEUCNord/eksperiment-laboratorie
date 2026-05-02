# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Session memory

Project memory is stored in `.claude/memory/`. Read `.claude/memory/MEMORY.md` at the start of every session to load context from previous conversations.

## What this is

Eksperiment Laboratorie — a Danish-language Next.js site of physics labs for HTX Fysik B and A. Each lab features a real experiment tightly coupled to interactive p5.js simulations. All UI copy is in Danish; keep new content in Danish unless asked otherwise.

## Commands

- `npm run dev` — start the Next.js dev server (default port 3000)
- `npm run build` / `npm start` — production build + serve
- `npm run lint` — `next lint`
- `TODOS.md` — development ideas and features to implement later

There is no test runner configured.

A preview launch config is committed at `.claude/launch.json` (named `next-dev`); use it with the preview tooling instead of running `next dev` via Bash.

## Available skills

- `/design-lab` — Design a new physics lab guide following the 6-phase template; generates a complete LabGuideConfig scaffold
- Memory consolidation — Use `/anthropic-skills:consolidate-memory` to audit and tidy memory files (durable context across sessions)

## Architecture

### Content model

The content tree is organized hierarchically by topic. Each topic lives in its own directory under [src/content/topics/](src/content/topics/), with individual labs as separate files grouped by topic. All types are defined in [src/content/types.ts](src/content/types.ts); the assembly is in [src/content/index.ts](src/content/index.ts).

**File structure:**
```
src/content/
├── index.ts                          (assembles topics, exports topics[])
├── types.ts                          (Lab, Topic, LabGuideConfig types)
└── topics/
    ├── mekanik/
    │   ├── index.ts                  (exports Topic + Lab[] for this topic)
    │   ├── hookes-lov.ts             (Lab definition)
    │   ├── skraat-kast.ts
    │   └── ...
    ├── energi/
    ├── elektriske-kredsloeb/
    ├── boelger/
    ├── atomfysik/
    ├── termodynamik/
    └── test-template/
        ├── index.ts
        ├── template-forsog.ts        (Lab with labGuide: true)
        └── template-forsog.config.ts (LabGuideConfig)
```

To add a lab, create a new file in the appropriate topic's directory (e.g., `src/content/topics/mekanik/my-lab.ts`) exporting a `Lab`. Each `Lab` has optional `goal`, `keyConcepts`, `keyEquation`, `theory`, `observations`, `simulationId`, `labGuide`, `labGuideConfig`. If `labGuide: true`, create a separate `[lab-slug].config.ts` file exporting the `LabGuideConfig`. Pages are statically generated from this data — there is no CMS.

The lab page conditionally renders sections per field, so a stub lab (just `slug`/`title`/`shortDescription`) renders an "Under udarbejdelse" placeholder.

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

### Lab guide system

Setting `labGuide: true` on a `Lab` entry replaces the simulation and observations sections with an interactive lab guide. The guide has three inquiry modes chosen by the student at runtime:

- **Guidet** — full step-by-step instructions at every phase
- **Semi-guidet** — brief overview + collapsible hint boxes
- **Åben undersøgelse** — just the tools, no prompting

**Recommended approach (2026-05-02):** Use the reusable `GenericLabGuide` component via a `LabGuideConfig`. This replaces the earlier lab-specific `HookesLovLabGuide` approach.

The guide flows through five phases: Planlæg (hypothesis + variable identification) → Opstil (apparatus setup + setup checklist) → Mål (data entry table with auto-calculated fields) → Analysér (Chart.js scatter plot with least-squares best-fit line, student value input, comparison against theory) → Konkludér (guided reflection questions + facit reveal).

Key files:
- [src/components/GenericLabGuide.tsx](src/components/GenericLabGuide.tsx) — reusable lab guide component (all 5 phases, 3 modes, state, validation, **persistence**)
- [src/components/HookesLovLabGuide.tsx](src/components/HookesLovLabGuide.tsx) — legacy lab-specific guide (to be refactored to use GenericLabGuide)
- [src/components/ForceExtensionChart.tsx](src/components/ForceExtensionChart.tsx) — Chart.js scatter + regression line; uses `chart.js` v4 + `react-chartjs-2` v5

The chart uses a `Scatter` component with `showLine: true` on the best-fit dataset (avoids mixed-type generic conflicts in Chart.js TypeScript). The regression is least-squares through origin: `k = Σ(xi·Fi) / Σ(xi²)`.

#### Data persistence (2026-05-02)

GenericLabGuide automatically persists student work to browser localStorage. On page refresh, students see their data restored with a notification. Each lab stores data independently via `lab-guide:${labSlug}` keys. Students can intentionally clear all work via a "Nulstil arbejde" button with confirmation dialog.

**What persists:** hypothesis, variable inputs, measurements, analysis values, reflections, and scaffolding mode choice. **What doesn't:** current phase (resets to 1), expanded hints, facit visibility.

See `src/hooks/useLabGuidePersistence.ts` and `.claude/memory/feature_persistence.md` for implementation details.

### Lab guide design standard (6-phase template)

All new lab guides should follow the **6-phase reusable template** documented in [docs/lab-guide-design-principles.md](docs/lab-guide-design-principles.md). This is the standard for every new lab — simulated and physical.

The 6 phases:
1. **Planlæg** — hypothesis formation, variable identification, prediction
2. **Opstil** — apparatus setup and measurement strategy (brief for simulations, critical for physical labs)
3. **Mål** — structured data collection with auto-calculated fields and validation
4. **Analysér** — chart analysis, key parameter estimation, comparison to theory
5. **Konkludér** — reflection, synthesis, model answer reveal
6. **Reportér** — formal lab report (optional; omit unless required)

Each phase adapts to three scaffolding modes: **Guidet** (heavy), **Semi-guidet** (hints), **Åben undersøgelse** (tools only).

#### How to add a new lab with GenericLabGuide

1. Create a `[lab-slug].ts` file in the appropriate topic folder with `labGuide: true`
2. Create a `[lab-slug].config.ts` exporting `LabGuideConfig`:
   - `hypothesis`: expected relationship (e.g., "F = mg")
   - `variables`: array of `Variable` with type (independent/dependent/control/derived), units, and expected answers
   - `measurementFields`: table columns with auto-calculate flags
   - `theoreticalValue` / `deviationThreshold`: for % comparison in Analysér
   - `reflectionQuestions`: prompts for Konkludér
   - `facit`: model answer (revealed on demand)
   - Validation flags: `validateVariableInputs`, `blockOnWrongVariableInputs`
3. See `src/content/topics/test-template/template-forsog.config.ts` for a complete example

When designing a new lab guide, use the `/design-lab` skill to generate a filled-out phase scaffold. See `.claude/memory/project_generic_lab_guide.md` for full API documentation.