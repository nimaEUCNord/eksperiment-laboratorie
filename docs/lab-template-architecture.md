# Lab template architecture

Implementation detail for the interactive lab guide system. CLAUDE.md gives the orientation; this file is the deep dive — read it when working on `LabTemplate`, adding a new lab with a guide, or extending the phase pipeline.

## Lab guide system

Setting `guide: { ... }` on a `LabConfig` replaces the simulation/observations sections with an interactive lab guide. Students choose one of three scaffolding modes:

- **Guidet** — full step-by-step instructions at every phase
- **Semi-guidet** — brief overview + collapsible hint boxes
- **Åben undersøgelse** — just the tools, no prompting

The guide flows through five phases: Planlæg (hypothesis + variable identification) → Opstil (apparatus setup + checklist + optional embedded sim) → Mål (data entry table with constants column) → Analysér (Chart.js scatter plot with configurable best-fit, student value input, % deviation panel) → Konkludér (reflection questions + facit reveal).

### Key files

- [src/components/LabTemplate/](../src/components/LabTemplate/) — the lab guide component, structured as a directory:
  - `index.tsx` — orchestrator: persistence wiring, phase routing via `PHASE_REGISTRY`, restore banner, reset modal
  - `types.ts` — `Phase`, `RealPhase`, `PhaseProps` contract, `PHASES` array
  - `state/reducer.ts` — single `useReducer` matching `PersistedLabGuideState`; `extractPersistedSlice` is the persistence integration point
  - `state/initialState.ts` — `buildInitialState` + helpers
  - `phases/index.ts` — `PHASE_REGISTRY: Record<RealPhase, ComponentType<PhaseProps>>`
  - `phases/Phase{1,2,3,4,5}*.tsx` + `PhaseChooser.tsx` + `PhaseProgressBar.tsx`
  - `components/` — shared sub-components (`PhaseNav`, `ResetWorkModal`, `EmbeddedSim`, `VariableInputRow`, `VariableHeaderCell`, `ResetWorkButton`)
  - `hooks/usePhase{1..5}State.ts` — each composes the reducer's state/dispatch into a phase-specific API (handlers, derived memos, validation)
- [src/components/MeasurementChart.tsx](../src/components/MeasurementChart.tsx) — generic Chart.js scatter; configurable axes, scales, fit mode
- [src/hooks/useLabGuidePersistence.ts](../src/hooks/useLabGuidePersistence.ts) — versioned localStorage save/restore

### Extending the template

Every phase implements the `PhaseProps` interface (`{ state, dispatch, lab, guide, accent, onAdvance, onRetreat, onRequestReset }`). The orchestrator binds advance/retreat from the `PHASES` order and renders `<PHASE_REGISTRY[state.phase] {...phaseProps} />` — no phase-routing if/else. To add Phase 6 Reportér: add `"report"` to `RealPhase`, push an entry to `PHASES`, create `Phase6Report.tsx` implementing `PhaseProps`, add it to `PHASE_REGISTRY`. To add a new persisted field: extend `PersistedLabGuideState` in the persistence hook + initial state + `extractPersistedSlice`; the save/restore effects pick it up automatically. Phase variants (e.g. multiple analysis modes in Phase 4) compose sub-components inside that phase's file.

### ChartConfig

`MeasurementChart` accepts a `ChartConfig` with these fields:

- `xField` / `yField` — variable names from `guide.variables`. The chart pulls raw values from each measurement row by these names.
- `xScale` / `yScale` — optional multipliers applied to the raw cell values, for unit conversion (e.g. `1/1000` to convert mm → m, or `9.82/1000` to convert g of mass into N of weight via `m·g`). Default 1.
- `xLabel` / `yLabel` — axis labels including units, rendered on the chart.
- `fitMode` — `"through-origin"` | `"free"` | `"none"`. Controls the best-fit line.
- `slopeSymbol` / `slopeUnit` — optional, for displaying the fitted slope.

**Canonical example** (from [src/content/topics/test-template/template-forsog.ts](../src/content/topics/test-template/template-forsog.ts)):

```ts
chart: {
  xField: "Uafhængig variabel",
  yField: "Afhængig variabel",
  xLabel: "Masse m (kg)",
  yLabel: "Kraft F (N)",
  fitMode: "through-origin",
  slopeSymbol: "g",
  slopeUnit: "m/s²",
}
```

This plots mass vs. force with a through-origin fit; the slope estimates `g`. No `xScale`/`yScale` are needed because the variable inputs are already in SI units. Add scales when raw inputs need conversion before plotting.

### Chart.js typing

Keep using `<Scatter>` with `showLine: true` on the fit dataset to avoid mixed-type generic conflicts.

## Data persistence

`LabTemplate` automatically persists student work to browser localStorage. On page refresh, students see their data restored with a notification. Each lab stores data independently via `lab-guide:${labSlug}` keys. Students can intentionally clear all work via a "Nulstil arbejde" button with confirmation dialog.

**What persists:** hypothesis, variable inputs, measurements, analysis values, reflections, and scaffolding mode choice. **What doesn't:** current phase (resets to 1), expanded hints, facit visibility.

The persistence layer is versioned (`SCHEMA_VERSION` in [useLabGuidePersistence.ts](../src/hooks/useLabGuidePersistence.ts), currently 2). Bump it whenever the persisted state shape changes incompatibly; old data is auto-discarded. The orchestrator's save/restore is two compact effects driven by `extractPersistedSlice(state)` from `state/reducer.ts` — no per-field hand-mapping.

## How to add a new lab

1. Create one file at `src/content/topics/[topic]/[lab-slug].ts` exporting a `LabConfig`. Add it to that topic's `index.ts`.
2. Set the identity fields (`slug`, `title`, `shortDescription`) plus any background sections (`goal`, `keyConcepts`, `keyEquation`, `theory`).
3. To enable the interactive guide, add a `guide: LabGuide` object:
   - **Phase 1**: `hypothesis`, `hypothesisPlaceholder`, `variables` (independent / dependent / control), and validation flags (`validateVariableInputs`, `blockOnWrongVariableInputs`).
   - **Phase 2**: `materials`, optional `materialImages` (typed as `Record<string, StaticImageData>`), `setupItems` (falls back to a generic 5-item list).
   - **Phase 3**: `minMeasurements`, `suggestedMeasurements`, `dataCollectionGuidance`, `blockOnMissingConstants`.
   - **Phase 4**: `chart` (see ChartConfig above), `theoreticalValue` + `theoreticalValueUnit`, `deviationThreshold`.
   - **Phase 5**: `reflectionQuestions`, `facit`.
   - Cross-cutting: `embedSimulationInPhases: ("opstil" | "maal" | "analyser")[]` to inline the sim, `bypassLocks` to disable progression locks.
4. To embed a simulation, set `simulationId` on the `LabConfig` and register the sim in [Simulation.tsx](../src/components/Simulation.tsx). The simulation is rendered standalone for guide-less labs, or inline within phases listed in `guide.embedSimulationInPhases`.

[src/content/topics/test-template/template-forsog.ts](../src/content/topics/test-template/template-forsog.ts) is the canonical scaffolded reference.

When designing a new lab guide, use the `/design-lab` skill to generate a filled-out phase scaffold.
