---
name: design-lab
description: >
  Design a new physics lab guide for Eksperiment Laboratorie following the standard 6-phase template
  (Planlæg → Opstil → Mål → Analysér → Konkludér → Reportér) with 3 scaffolding modes
  (Guidet, Semi-guidet, Åben undersøgelse). Use this skill whenever the user types /design-lab,
  asks to "design a new lab", "create a lab guide", "add a new lab", or wants to build a new
  physics experiment for the HTX Fysik A platform — even if they just name a topic like
  "lav et pendul-forsøg" or "jeg skal bruge et nyt laboratorium".
---

# Design Lab Skill

You are helping design a new interactive physics lab guide for **Eksperiment Laboratorie** — a Danish-language HTX Fysik A platform. Every lab guide follows a standard 6-phase structure with three scaffolding modes.

## Step 1: Read the design principles

Before doing anything else, read the full design principles document:

```
docs/lab-guide-design-principles.md
```

This document is the authoritative reference for what each phase should contain and how the three modes differ. Re-read it every time this skill runs so you stay aligned.

## Step 2: Gather lab details

Ask the user these questions (all at once, not one by one):

1. **Emne** (Topic): Which of the 6 topics does this lab belong to? (Mekanik, Energi, Elektriske Kredsløb, Bølger, Atomfysik, Termodynamik)
2. **Forsøgsnavn** (Lab name): What is the lab called in Danish? (e.g., "Det simple pendul", "Ohms lov", "Lydbølgers interferens")
3. **Type**: Is this a simulation lab, a physical lab, or both?
4. **Læringsmål** (Learning goal): What should students understand by the end? (1–2 sentences)
5. **Nøglerelation** (Key relationship): What is the main equation or proportionality? (e.g., T = 2π√(l/g), U = R·I)
6. **Analyseparameter** (Analysis parameter): What key value will students estimate from their data? (e.g., g, R, f) — include units
7. **Referencenværdi** (Reference value): What is the theoretical or simulation value of that parameter? (e.g., 9.82 m/s², depends on the simulation)
8. **Målekolonner** (Measurement columns): What columns does the data table need? (e.g., Længde (cm), Svingningstid for 10 svingninger (s), Beregnet periode T (s))
9. **Reportér påkrævet?** (Report required?): Should the 6th phase (formal lab report) be included?

If the user has already provided some of this in their message, extract it and only ask for what's missing.

## Step 3: Generate the lab scaffold

Produce a complete Danish-language lab design document in this exact structure:

---

### LAB DESIGN: [Forsøgsnavn]

**Emne:** [Topic]  
**Type:** [Simulation / Fysisk / Begge]  
**Nøglerelation:** [Equation]  
**Læringsmål:** [Goal]

---

#### Fase 1 — Planlæg

**Guidet:**
[3–5 numbered steps. Include: research question framing, hypothesis prompt with sentence starter ("Min hypotese er, at [parameter] er [direkte/omvendt] proportional med [variabel], fordi..."), variable identification (uafhængig, afhængig, kontrol)]

**Semi-guidet:**
[1–2 sentence overview + 2 collapsible hints (💡). Hints help with hypothesis wording and variable identification without giving the answer]

**Åben:**
[Single open prompt: "Skriv din hypotese og beskriv, hvilke variable du vil undersøge."]

---

#### Fase 2 — Opstil

**Guidet:**
[For simulation labs: 2–3 steps to initialize the simulation (reset, verify initial state, note what to measure). For physical labs: 5–8 steps covering calibration, zeroing, safety, equipment check]

**Semi-guidet:**
[Brief checklist (3–4 items) + 1 hint about common setup mistakes]

**Åben:**
[No instructions. Just note what apparatus/simulation is available.]

---

#### Fase 3 — Mål

**Tabelkolonner:**
| Kolonne | Type | Beregning |
|---------|------|-----------|
[List each column with whether it's "Manuelt" (student enters) or "Beregnet" (auto-calculated), and the formula for calculated columns]

**Guidet:**
[4–6 numbered measurement steps with specific instructions for each trial. Include: which variable to change, how many values to try, how to record carefully]

**Semi-guidet:**
[2–3 sentence overview + 2 hints (avoid systematic errors, how many trials recommended)]

**Åben:**
[Just the table. No instructions.]

**Validering:** Minimum [N] gyldige datapunkter kræves for at fortsætte. (Suggest 4–6 based on the lab)

---

#### Fase 4 — Analysér

**Graf:**
[Describe the chart: axes labels with units, what the scatter plot shows, what the best-fit line represents, what its slope/intercept means]

**Regressionsmetode:** [Describe the math: least-squares through origin, or linear with intercept, depending on the relationship]

**Sammenligningspanel:**
- Elevens estimat: [parameter name] = _____ [unit]
- Referencenværdi: [theoretical value] [unit]
- Farvekodet feedback: grøn <10%, gul 10–20%, rød >20% afvigelse

**Guidet:**
[3–4 steps: how to read the slope from the graph, how to calculate the parameter, how to interpret the % deviation]

**Semi-guidet:**
[Brief overview + 2 hints: reading slope, interpreting deviation]

**Åben:**
[Chart and input field only. No guidance.]

---

#### Fase 5 — Konkludér

**Refleksionsspørgsmål (Guidet):**
1. [Question about the discovered relationship — connect to the equation]
2. [Question comparing their result to the reference value]
3. [Question about error sources]
4. [Question about real-world application]

**Forventet konklusion (model answer, 3–4 sentences):**
[Write the expected conclusion in Danish. Should state: what relationship was found, how well the measurement matched theory, likely error sources, and one real-world example]

**Semi-guidet:**
[Main question + 2 hints]

**Åben:**
["Skriv en kort konklusion om, hvad du fandt i dette forsøg."]

---

#### Fase 6 — Reportér [VALGFRI / UDELADES]

[Either describe the report structure if required, or write "Denne fase er ikke påkrævet for dette forsøg."]

---

### TypeScript-konfiguration

Create one file at `src/content/topics/[topic]/[slug].ts` exporting a single `LabConfig`. Then add the import + reference to that topic's `index.ts`.

```typescript
import type { LabConfig } from "@/content/types";

export const [camelCaseSlug]: LabConfig = {
  slug: "[kebab-case-slug]",
  title: "[Forsøgsnavn]",
  shortDescription: "[1 sentence, Danish]",
  goal: "[Læringsmål]",
  keyConcepts: ["[Concept 1]", "[Concept 2]", "[Concept 3]"],
  keyEquation: "[LaTeX, e.g. 'T = 2\\pi\\sqrt{l/g}']",
  // simulationId: "[sim-id]", // add when sim is built and registered in Simulation.tsx
  guide: {
    hypothesis: "[Pre-filled expected relationship]",
    hypothesisPlaceholder: "[Sentence-starter for the student's input]",
    validateVariableInputs: true,
    blockOnWrongVariableInputs: false,
    bypassLocks: true,
    minMeasurements: 4,
    suggestedMeasurements: 6,
    variables: [
      { name: "[Independent var name]", type: "independent",
        expectedPhysicalQuantity: "[…]", expectedSymbol: "[…]", expectedUnit: ["[…]"] },
      { name: "[Dependent var name]", type: "dependent",
        expectedPhysicalQuantity: "[…]", expectedSymbol: "[…]", expectedUnit: ["[…]"] },
      { name: "[Control var name]", type: "control",
        expectedPhysicalQuantity: "[…]", expectedSymbol: "[…]", expectedUnit: ["[…]"] },
    ],
    materials: ["[Item 1]", "[Item 2]"],
    setupItems: [/* phase-2 checklist; omit to use the generic 5-item default */],
    embedSimulationInPhases: ["opstil", "maal", "analyser"], // omit if no sim
    chart: {
      xField: "[Variable name from variables[]]",
      yField: "[Variable name from variables[]]",
      xScale: 1,                         // multiplier applied to raw cell values (e.g. 1/1000 for mm→m)
      yScale: 1,                         // e.g. 9.82/1000 for g→N (m·g)
      xLabel: "[Axis label with unit]",
      yLabel: "[Axis label with unit]",
      fitMode: "through-origin",         // or "free" or "none"
      slopeSymbol: "[k]",
      slopeUnit: "[N/m]",
    },
    theoreticalValue: 0,
    theoreticalValueUnit: "[unit]",
    deviationThreshold: 10,
    reflectionQuestions: [
      "1. [Question about discovered relationship]",
      "2. [Question comparing measurement to theory]",
      "3. [Question about error sources]",
      "4. [Question about real-world application]",
    ],
    facit: "[3–4 sentence model answer in Danish]",
  },
};
```

---

For component locations and reference labs, see [docs/lab-template-architecture.md](../../../docs/lab-template-architecture.md).

---

## Output notes

- Write all student-facing content in Danish
- Write developer notes (TypeScript, component instructions) in English
- Be specific: write actual prompt text for each mode, not just descriptions of what to write
- The scaffold is a starting point — the user will refine it before implementing
