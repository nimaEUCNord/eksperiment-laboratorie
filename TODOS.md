# Development Todos & Ideas

Last updated: 2026-05-04 (revised)

## 🎯 Features (Next)
- [ ] Choose simulation option when choosing inquiry type — When a lab has a `simulationId` and `embedSimulationInPhases` set, let students toggle simulation use during the mode-selection screen, before entering Phase 1
- [ ] Make sketch for forsøgsopstilling for template-forsøg — Create diagram/illustration of experiment setup to display in Phase 2 sketch area
- [ ] Phase 1 hypothesis keyword validation — Add configurable keyword checking for hypothesis field to ensure students include required concepts before proceeding to Phase 2
- [ ] Phase 3 data export to CSV/Excel — Add button in Phase 3 to export measurement data, constants, and metadata so students can save their data for further analysis. Offer CSV as the simple option and Excel (.xlsx) for a structured file with headers and calculated values.
- [ ] Remove "fx" placeholder hints from Phase 1 variable input fields — The example text in the variable fields may be giving too much away; remove or replace with neutral placeholders.
- [ ] Make hints and attempts visually consistent across all Tjek interactions — Currently the feedback UI (attempt counter, hint text, correct/wrong highlighting) differs between Tjek Variabler and Tjek Hypotese in Phase 1. Unify into a shared visual language.

## 💡 Ideas (Backlog)
- [ ] Offline mode — Enable the site to function without internet access (e.g. service worker / PWA caching) so students can run lab guides in classrooms with poor connectivity.
- [ ] Print lab guide option — Add a print-friendly view of the lab guide (all phases, student answers, results) so students or teachers can produce a paper copy or PDF of completed work.
- [ ] Possible removal of Tyngdekraft box in `TemplateForsog` — Students can already read the force value from the dynamometer pointer; the stat box may be redundant. Decide whether to keep it as a learning aid or remove it to push students to read the instrument. See `LAB_CONFIG.stats.force` and the `stats` callback in [src/components/sims/TemplateForsog.tsx](src/components/sims/TemplateForsog.tsx).

## 🐛 Known Issues / Bugs
- **Phase 1 answer reveal too fast** — Students get the right answer instantly after entering a wrong answer, defeating pedagogical purpose. Needs smarter feedback mechanism that guides without giving away the answer.
- **Phase 2 materials list disappears** — The materials list in Phase 2 (Opstil) intermittently vanishes. Root cause unknown; investigate rendering/state conditions that cause the list to not render.

## 🔧 Refactoring / Tech Debt
- [ ] Migrate `HookesLov` and `SkraatKast` to `SimulationFrame` — Both sims still inline their own `SliderField`, canvas wrapper, and (Hookes only) `Stat` row. The scaffold in [src/components/sims/SimulationFrame.tsx](src/components/sims/SimulationFrame.tsx) absorbs all of that; `TemplateForsog.tsx` is the reference for the migration pattern.
- [ ] Decide whether `TjekFeedback`'s "correct" emerald box should also drop its border/background to match the new bare-text wrong-state style — currently asymmetric (wrong = bare orange via `PhaseLockHint`, correct = boxed emerald). Either downgrade correct to a single emerald-600 line for visual symmetry, or document the deliberate asymmetry (boxed = success affirmation).
- [ ] Revisit Tjek button enable/disable states in Phase 1 — buttons currently dim via `opacity-40` when `canAdvanceVars`/`canAdvanceHyp` is true, which inverts the usual "disabled = dim" intuition. Consider clarifying or unifying with how the Næste-fase button behaves elsewhere.
- [ ] Audit other phases (2 Opstil, 4 Analysér, 5 Konkludér) for boxed-hint patterns that should adopt the new `PhaseLockHint` shared component — keeps lock/hint visuals consistent across the whole guide.

## 📚 Documentation
- 

## ✅ Completed (Archive)
- [x] Add graph canvas to Phase 4 (Analysér) — `MeasurementChart` now renders inside Phase 4 with X-akse/Y-akse dropdowns when `guide.chart` is set. Selection persists (schema v4) and falls back to configured defaults when the picked pair isn't the original.
- [x] Phase progress bar navigation enforces the same locks as "Næste fase" — `handleProgressBarSelect` in the orchestrator calls the phase's registered validated-advance handler for forward navigation; backward always allowed.
