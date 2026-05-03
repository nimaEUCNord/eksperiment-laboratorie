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

A preview launch config is committed at `.claude/launch.json` (named `next-dev`); use it with the preview tooling instead of running `next dev` via Bash. **Do not run `npm run build` while the dev server is running** — they fight over `.next/` and corrupt the cache. Stop the dev server first, or use a separate build directory.

## Available skills

- `/design-lab` — Design a new physics lab guide following the 6-phase template; generates a complete `LabConfig` with nested `guide`
- Memory consolidation — Use `/anthropic-skills:consolidate-memory` to audit and tidy memory files (durable context across sessions)

## Architecture

### Content model

The content tree is organised hierarchically by topic. Each topic lives in its own directory under [src/content/topics/](src/content/topics/), with one file per lab. All types are defined in [src/content/types.ts](src/content/types.ts); the assembly is in [src/content/index.ts](src/content/index.ts).

**Single source of truth per lab:** every lab is one `LabConfig` object exported from one file. Identity, background sections (goal/theory/keyConcepts), and the optional interactive guide all live in the same object. There is no separate `.config.ts`.

**File structure:**
```
src/content/
├── index.ts                          (assembles topics, exports topics[])
├── types.ts                          (LabConfig, LabGuide, Topic, ChartConfig, ...)
└── topics/
    ├── mekanik/
    │   ├── index.ts                  (exports Topic + LabConfig[] for this topic)
    │   ├── hookes-lov.ts             (full LabConfig with guide)
    │   ├── skraat-kast.ts
    │   └── ...
    ├── energi/
    ├── elektriske-kredsloeb/
    ├── boelger/
    ├── atomfysik/
    ├── termodynamik/
    └── test-template/
        ├── index.ts
        └── template-forsog.ts        (canonical reference — full LabConfig with guide)
```

To add a lab, create a new file in the appropriate topic's directory (e.g., `src/content/topics/mekanik/my-lab.ts`) exporting a `LabConfig`. Pages are statically generated from this data — there is no CMS.

A stub lab (only `slug`/`title`/`shortDescription` set) renders an "Under udarbejdelse" placeholder. Adding `goal` + `keyConcepts` flips it to fully rendered.

### Routing

- `/` — landing page, lists topics
- `/emner/[topic]` — topic page, lists labs
- `/emner/[topic]/[lab]` — lab page, renders content sections + simulation or guide

Both dynamic routes use `generateStaticParams` over `getAllTopics()`, so the whole site pre-renders at build time. `getTopic` / `getLab` in [src/lib/content.ts](src/lib/content.ts) are the lookup helpers.

### Simulations

Simulations are React client components living in `src/components/sims/`. The router-side flow:

1. The lab data references a sim by string id (`LabConfig.simulationId`).
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

Tailwind v4 (CSS-first, configured via PostCSS — no `tailwind.config.ts`). Topic colors are centralised in [src/lib/accent.ts](src/lib/accent.ts): each `AccentColor` maps to a bundle of Tailwind classes (`bg`, `bgSoft`, `text`, `border`, …). When writing a new topic, pick from the existing six palette names rather than inventing new colors. Topic/lab pages and cards consume the bundle via `getAccent(topic.accentColor)`.

### Lab page rendering

[src/app/emner/\[topic\]/\[lab\]/page.tsx](src/app/emner/[topic]/[lab]/page.tsx) is the single template that renders every lab. It reads optional fields off the `LabConfig` and conditionally renders sections via [LabPageContent.tsx](src/components/LabPageContent.tsx).

Routing logic, top-down:
- Background sections (Formål, Centrale begreber, Nøgleligning, Teori) render whenever the corresponding fields are set; collapsible when a guide is present.
- If `lab.guide` is set → render `<LabTemplate>` (the only guide implementation).
- Otherwise → if `simulationId` is set, render `<Simulation>`; if `observations` is set, render the "I laboratoriet" list.
- If `goal` and `keyConcepts` are missing, the "Under udarbejdelse" placeholder is appended.

New optional fields on `LabConfig` should be added to [types.ts](src/content/types.ts) and rendered conditionally in `LabPageContent`, following the existing pattern.

### Lab guide system

Setting `guide: { ... }` on a `LabConfig` replaces the simulation/observations sections with an interactive lab guide. Students choose one of three scaffolding modes:

- **Guidet** — full step-by-step instructions at every phase
- **Semi-guidet** — brief overview + collapsible hint boxes
- **Åben undersøgelse** — just the tools, no prompting

The guide flows through five phases: Planlæg (hypothesis + variable identification) → Opstil (apparatus setup + checklist + optional embedded sim) → Mål (data entry table with constants column) → Analysér (Chart.js scatter plot with configurable best-fit, student value input, % deviation panel) → Konkludér (reflection questions + facit reveal).

Key files:
- [src/components/LabTemplate.tsx](src/components/LabTemplate.tsx) — the only lab guide component (all 5 phases, 3 modes, state, validation, persistence)
- [src/components/MeasurementChart.tsx](src/components/MeasurementChart.tsx) — generic Chart.js scatter; configurable axes, scales, fit mode
- [src/hooks/useLabGuidePersistence.ts](src/hooks/useLabGuidePersistence.ts) — versioned localStorage save/restore

`MeasurementChart` accepts a `ChartConfig` (`xField`, `yField`, `xLabel`, `yLabel`, optional `xScale`/`yScale`, `fitMode: "through-origin" | "free" | "none"`, optional `slopeSymbol`/`slopeUnit`). `xField`/`yField` are the variable names from `guide.variables` — the chart pulls raw values from each measurement row, applies the optional scales, and fits a line through the resulting points. For Hookes' law: `xField: "Forlængelse"` with `xScale: 1/1000` (mm → m); `yField: "Masse"` with `yScale: 9.82/1000` (g → N via `m·g`); `fitMode: "through-origin"`; `slopeSymbol: "k"`; `slopeUnit: "N/m"`.

Chart.js typing: keep using `<Scatter>` with `showLine: true` on the fit dataset to avoid mixed-type generic conflicts.

#### Data persistence

`LabTemplate` automatically persists student work to browser localStorage. On page refresh, students see their data restored with a notification. Each lab stores data independently via `lab-guide:${labSlug}` keys. Students can intentionally clear all work via a "Nulstil arbejde" button with confirmation dialog.

**What persists:** hypothesis, variable inputs, measurements, analysis values, reflections, and scaffolding mode choice. **What doesn't:** current phase (resets to 1), expanded hints, facit visibility.

The persistence layer is versioned (`SCHEMA_VERSION` in [useLabGuidePersistence.ts](src/hooks/useLabGuidePersistence.ts)). Bump it whenever the persisted state shape changes; old data is auto-discarded.

### Lab guide design standard (6-phase template)

All new lab guides should follow the **6-phase reusable template** documented in [docs/lab-guide-design-principles.md](docs/lab-guide-design-principles.md). The implementation today covers phases 1–5; **Reportér** (phase 6) is opt-in for labs that need a formal report.

The 6 phases:
1. **Planlæg** — hypothesis formation, variable identification, prediction
2. **Opstil** — apparatus setup and measurement strategy (brief for simulations, critical for physical labs)
3. **Mål** — structured data collection
4. **Analysér** — chart analysis, key parameter estimation, comparison to theory
5. **Konkludér** — reflection, synthesis, model answer reveal
6. **Reportér** — formal lab report (optional)

Each phase adapts to three scaffolding modes.

#### How to add a new lab

1. Create one file at `src/content/topics/[topic]/[lab-slug].ts` exporting a `LabConfig`. Add it to that topic's `index.ts`.
2. Set the identity fields (`slug`, `title`, `shortDescription`) plus any background sections (`goal`, `keyConcepts`, `keyEquation`, `theory`).
3. To enable the interactive guide, add a `guide: LabGuide` object:
   - **Phase 1**: `hypothesis`, `hypothesisPlaceholder`, `variables` (independent / dependent / control), and validation flags (`validateVariableInputs`, `blockOnWrongVariableInputs`).
   - **Phase 2**: `materials`, optional `materialImages` (typed as `Record<string, StaticImageData>`), `setupItems` (falls back to a generic 5-item list).
   - **Phase 3**: `minMeasurements`, `suggestedMeasurements`, `dataCollectionGuidance`, `blockOnMissingConstants`.
   - **Phase 4**: `chart` (see ChartConfig above), `theoreticalValue` + `theoreticalValueUnit`, `deviationThreshold`.
   - **Phase 5**: `reflectionQuestions`, `facit`.
   - Cross-cutting: `embedSimulationInPhases: ("opstil" | "maal" | "analyser")[]` to inline the sim, `bypassLocks` to disable progression locks.
4. To embed a simulation, set `simulationId` on the `LabConfig` and register the sim in [Simulation.tsx](src/components/Simulation.tsx). The simulation is rendered standalone for guide-less labs, or inline within phases listed in `guide.embedSimulationInPhases`.

[src/content/topics/test-template/template-forsog.ts](src/content/topics/test-template/template-forsog.ts) is the canonical reference. [src/content/topics/mekanik/hookes-lov.ts](src/content/topics/mekanik/hookes-lov.ts) is a real production lab with embedded sim and chart.

When designing a new lab guide, use the `/design-lab` skill to generate a filled-out phase scaffold.
