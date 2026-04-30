---
name: Lab Guide 6-Phase Template
description: Standard 6-phase structure for all new lab guides in Eksperiment Laboratorie — simulated and physical labs
type: project
---
All new lab guides for Eksperiment Laboratorie follow a **6-phase reusable template** with three scaffolding modes. This is the agreed design standard.

**Phases:** Planlæg → Opstil → Mål → Analysér → Konkludér → Reportér

1. **Planlæg** — hypothesis formation, variable identification, prediction before touching apparatus
2. **Opstil** — apparatus/simulation setup; brief for simulation labs, detailed for physical labs
3. **Mål** — structured data table with auto-calculated fields (e.g., F = mg), requires ≥4 valid rows to proceed
4. **Analysér** — interactive chart (Chart.js), student estimates key parameter (e.g., k), compared to theory with color-coded % feedback
5. **Konkludér** — written reflection, guided prompts, model answer revealed on demand
6. **Reportér** — formal lab report (optional; omit unless explicitly required for the lab)

**Scaffolding modes** (student-selectable at start):
- **Guidet** — step-by-step instructions, sentence starters, checklists
- **Semi-guidet** — brief overview + expandable 💡 hint boxes
- **Åben undersøgelse** — tools only, no guidance

**Why:** Balances inquiry-based learning (hypothesis → analysis → conclusion) with explicit procedure training (setup, measurement strategy). Designed as a reusable template so all labs have consistent UX and students learn the rhythm once.

**Reportér is optional by default** — decide at lab-design time whether formal reporting is required.

**Full reference:** `docs/lab-guide-design-principles.md` in the project repo

**How to apply:** When asked to design or build a new lab guide, always start from this 6-phase structure. Use `/design-lab` skill to generate a scaffold.
