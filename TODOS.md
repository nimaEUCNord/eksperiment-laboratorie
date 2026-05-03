# Development Todos & Ideas

Last updated: 2026-05-02

## 🎯 Features (Next)
- [ ] Make sketch for forsøgsopstilling for template-forsøg — Create diagram/illustration of experiment setup to display in Phase 2 sketch area
- [ ] Phase 1 hypothesis keyword validation — Add configurable keyword checking for hypothesis field to ensure students include required concepts before proceeding to Phase 2
- [ ] Phase 3 data export to Excel — Add button in Phase 3 to export measurement data, constants, and metadata to a well-structured Excel file (includes headers, data, calculated values) 

## 💡 Ideas (Backlog)
- 

## 🐛 Known Issues / Bugs
- **Phase 1 answer reveal too fast** — Students get the right answer instantly after entering a wrong answer, defeating pedagogical purpose. Needs smarter feedback mechanism that guides without giving away the answer.

## 🔧 Refactoring / Tech Debt
- 

## 📚 Documentation
- Phase 2 checkmark condition should trigger on ALL materialer and tjekliste boxes — When `requireAllMaterialsChecked: true`, Phase 2 checkmark only shows when ALL materials AND ALL setup items are checked (not partial completion). Ensure this behavior is consistent across all labs using this config.
- `requireAllMaterialsChecked` should be a on lab by lab basis toggle — Different labs may have different requirements for Phase 2 completion (some require all materials checked, others just require some to be initiated). This is configurable per lab in the LabGuideConfig, allowing flexibility across different experiment types.

## ✅ Completed (Archive)
