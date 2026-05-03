# Development Todos & Ideas

Last updated: 2026-05-02

## 🎯 Features (Next)
- [ ] Choose simulation option when choosing inquiry type — When a lab has a `simulationId` and `embedSimulationInPhases` set, let students toggle simulation use during the mode-selection screen, before entering Phase 1
- [ ] Make sketch for forsøgsopstilling for template-forsøg — Create diagram/illustration of experiment setup to display in Phase 2 sketch area
- [ ] Phase 1 hypothesis keyword validation — Add configurable keyword checking for hypothesis field to ensure students include required concepts before proceeding to Phase 2
- [ ] Phase 3 data export to Excel — Add button in Phase 3 to export measurement data, constants, and metadata to a well-structured Excel file (includes headers, data, calculated values) 

## 💡 Ideas (Backlog)
- 

## 🐛 Known Issues / Bugs
- **Phase 1 answer reveal too fast** — Students get the right answer instantly after entering a wrong answer, defeating pedagogical purpose. Needs smarter feedback mechanism that guides without giving away the answer.

## 🔧 Refactoring / Tech Debt
- [ ] Migrate `HookesLov` and `SkraatKast` to `SimulationFrame` — Both sims still inline their own `SliderField`, canvas wrapper, and (Hookes only) `Stat` row. The scaffold in [src/components/sims/SimulationFrame.tsx](src/components/sims/SimulationFrame.tsx) absorbs all of that; `TemplateForsog.tsx` is the reference for the migration pattern.

## 📚 Documentation
- 

## ✅ Completed (Archive)
