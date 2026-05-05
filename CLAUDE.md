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

**Verification scope.** When verifying changes via the preview tools (preview_start, preview_snapshot, preview_click, preview_screenshot, etc.), only exercise the skabelon lab at `/emner/test-template/template-forsog`. Do not navigate to or interact with production labs unless the user explicitly asks. The skabelon lab is the canonical reference scaffold; production labs contain finalised student content that should not be poked at during verification.

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
3. The sim component itself is `"use client"`, wraps `<SimulationFrame>` (which absorbs slider state, the canvas wrapper, and the stat row), and lifts lab-tunable values into a top-of-file `LAB_CONFIG`. [src/components/sims/TemplateForsog.tsx](src/components/sims/TemplateForsog.tsx) is the canonical reference; `SkraatKast.tsx` is a pre-scaffold variant pending migration.

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

Setting `guide: { ... }` on a `LabConfig` replaces the simulation/observations sections with an interactive lab guide. Students choose one of three scaffolding modes (Guidet / Semi-guidet / Åben undersøgelse). The guide flows through five phases: Planlæg → Opstil → Mål → Analysér → Konkludér.

All new lab guides follow the **6-phase reusable template** documented in [docs/lab-guide-design-principles.md](docs/lab-guide-design-principles.md). The implementation today covers phases 1–5; **Reportér** (phase 6) is opt-in.

Implementation detail (component topology under [src/components/LabTemplate/](src/components/LabTemplate/), persistence layer, ChartConfig specifics, walkthrough for adding a new lab) lives in [docs/lab-template-architecture.md](docs/lab-template-architecture.md). Use the `/design-lab` skill to scaffold a new lab guide.
