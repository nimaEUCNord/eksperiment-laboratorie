# Development Todos & Ideas

Last updated: 2026-05-02

## 🎯 Features (Next)
- [ ] Choose simulation option when choosing inquiry type — When a lab has a `simulationId` and `embedSimulationInPhases` set, let students toggle simulation use during the mode-selection screen, before entering Phase 1
- [ ] Make sketch for forsøgsopstilling for template-forsøg — Create diagram/illustration of experiment setup to display in Phase 2 sketch area
- [ ] Phase 1 hypothesis keyword validation — Add configurable keyword checking for hypothesis field to ensure students include required concepts before proceeding to Phase 2
- [ ] Phase 3 data export to CSV/Excel — Add button in Phase 3 to export measurement data, constants, and metadata so students can save their data for further analysis. Offer CSV as the simple option and Excel (.xlsx) for a structured file with headers and calculated values.
- [ ] Remove "fx" placeholder hints from Phase 1 variable input fields — The example text in the variable fields may be giving too much away; remove or replace with neutral placeholders.
- [ ] Make hints and attempts visually consistent across all Tjek interactions — Currently the feedback UI (attempt counter, hint text, correct/wrong highlighting) differs between Tjek Variabler and Tjek Hypotese in Phase 1. Unify into a shared visual language.
- [ ] Phase progress bar navigation should enforce the same locks as "Næste fase" — Clicking a phase in the progress bar currently bypasses progression requirements that the Næste fase button enforces. The two paths should apply identical validation before allowing the jump.
- [ ] Add graph canvas to Phase 4 (Analysér) — Students should be able to plot their Phase 3 measurements directly in Phase 4 to visually analyse the relationship between variables. Consider using the existing `MeasurementChart` component with the lab's `ChartConfig`.
- [ ] "Nulstil arbejde" should return to inquiry type selection — After confirming the reset, clear all persisted state and navigate back to the `PhaseChooser` screen so students can pick a new scaffolding mode from scratch.
- [ ] 
## 💡 Ideas (Backlog)
- [ ] Possible removal of Tyngdekraft box in `TemplateForsog` — Students can already read the force value from the dynamometer pointer; the stat box may be redundant. Decide whether to keep it as a learning aid or remove it to push students to read the instrument. See `LAB_CONFIG.stats.force` and the `stats` callback in [src/components/sims/TemplateForsog.tsx](src/components/sims/TemplateForsog.tsx).

## 🐛 Known Issues / Bugs
- **Phase 1 answer reveal too fast** — Students get the right answer instantly after entering a wrong answer, defeating pedagogical purpose. Needs smarter feedback mechanism that guides without giving away the answer.
- **Phase 2 materials list disappears** — The materials list in Phase 2 (Opstil) intermittently vanishes. Root cause unknown; investigate rendering/state conditions that cause the list to not render.

## 🔧 Refactoring / Tech Debt
- [ ] Migrate `HookesLov` and `SkraatKast` to `SimulationFrame` — Both sims still inline their own `SliderField`, canvas wrapper, and (Hookes only) `Stat` row. The scaffold in [src/components/sims/SimulationFrame.tsx](src/components/sims/SimulationFrame.tsx) absorbs all of that; `TemplateForsog.tsx` is the reference for the migration pattern.

## 📚 Documentation
- 

## ✅ Completed (Archive)
