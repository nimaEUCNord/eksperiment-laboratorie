# Lab Guide Design Principles: 6-Phase Structure

## Overview
This document defines the standard 6-phase lab guide structure for Eksperiment Laboratorie. All interactive physical and simulated labs should follow this structure to provide consistency, reusability, and pedagogical coherence across the platform.

**Target audience:** HTX Fysik A students (ages 16–19)  
**Pedagogical balance:** Inquiry-based learning + practical procedure training  
**Structure:** Reusable template with phase-specific components and three scaffolding modes

---

## The 6 Phases

### 1. Planlæg (Plan)
**Pedagogical purpose:** Explicit hypothesis formation and experimental design thinking

**What happens:**
- Students formulate a research question or hypothesis
- Identify independent, dependent, and control variables
- Predict the expected outcome before interacting with apparatus/simulation
- Preview the lab setup and measurement strategy

**Guided mode scaffolding:**
- Step-by-step prompts for each sub-question
- Sentence starters and examples of good hypotheses
- Explicit variable identification checklist

**Semi-guided scaffolding:**
- Brief overview of what to plan
- 1–2 expandable hints (e.g., "What changes and what stays the same?")

**Open inquiry scaffolding:**
- Blank text field; students write freely
- No prompts or examples

**Key principle:** Planning is explicit, not implicit. Students articulate their thinking before data collection.

**Implementation notes:**
- For simulated labs: Planning takes 2–5 minutes
- For physical labs: Planning includes equipment identification and safety review
- Content is lab-specific; cannot be fully templated (customize per lab)

---

### 2. Opstil (Set up)
**Pedagogical purpose:** Apparatus preparation and measurement strategy; error mitigation

**What happens:**
- Students perform or review setup steps (calibration, initialization, safety checks)
- Confirm that apparatus is in the correct initial state
- Verify they understand what they will measure and how many trials they'll run
- For simulations: Initialize the digital apparatus (reset, zero, etc.)
- For physical labs: Calibrate sensors, check for mechanical issues, establish baseline

**Guided mode scaffolding:**
- Step-by-step procedure with screenshots or animations
- Explicit warnings about critical errors (e.g., "Don't forget to zero the scale before measuring")
- Confirmation checkboxes: "Have you zeroed the apparatus?" before proceeding

**Semi-guided scaffolding:**
- Brief checklist of setup steps
- Hints on common mistakes

**Open inquiry scaffolding:**
- Just show the apparatus; students figure out what to do
- No guidance

**Key principle:** Setup is often where experiments fail. Explicit scaffolding prevents careless errors.

**Implementation notes:**
- For simulated labs: Can be minimal (1 reset button + confirmation)
- For physical labs: Critical and detailed (5–10 steps)
- Design decision at lab-creation time: include or combine with Plan/Measure

---

### 3. Mål (Measure)
**Pedagogical purpose:** Structured, repeatable data collection

**What happens:**
- Students collect quantitative measurements in a structured table
- Automatic calculations fill in derived quantities (e.g., F = mg)
- Table validates data (must be positive, finite numbers)
- Minimum data points required before proceeding (e.g., ≥4 rows)
- Row count can be expanded dynamically

**Guided mode scaffolding:**
- Detailed procedure for each measurement (e.g., "Step 1: Set mass to 100g...")
- Numbered steps with descriptions of expected behavior

**Semi-guided scaffolding:**
- Brief overview of how to measure
- Hints on avoiding systematic errors (e.g., damping oscillations)

**Open inquiry scaffolding:**
- Just the table; no guidance

**Key principle:** Data collection is structured, repeatable, and validates itself. Students cannot proceed with incomplete or malformed data.

**Implementation notes:**
- Columns are lab-specific (e.g., Hooke's Law: mass, extension; Pendulum: length, period)
- Auto-calculated columns save time and reduce arithmetic errors
- Validation threshold (e.g., ≥4 rows) is configurable per lab
- Table is fully reusable; CSS and logic are generic

---

### 4. Analysér (Analyze)
**Pedagogical purpose:** Graphical interpretation, quantitative analysis, comparison to theory

**What happens:**
- Data is plotted on an interactive chart (scatter plot, line graph, etc.)
- Students extract or estimate the key relationship (e.g., slope = spring constant k)
- Automatic best-fit line or trend line aids interpretation
- Student's estimate is compared to the theoretical or simulation value
- Feedback is color-coded (green = close, amber = moderate error, red = large error)
- Model answer or reference value is shown

**Guided mode scaffolding:**
- Detailed instructions on how to read the graph (e.g., "The slope tells you k...")
- Step-by-step procedure for calculating the key quantity
- Prompts: "Does your value match the simulation? Why?"

**Semi-guided scaffolding:**
- Brief overview of what the graph shows
- 1–2 hints on reading slopes or comparing to theory

**Open inquiry scaffolding:**
- Chart only; no guidance on interpretation

**Key principle:** Analysis is both visual (pattern recognition) and quantitative (calculation). Students compare their findings to theory.

**Implementation notes:**
- Chart type is lab-specific (scatter, line, histogram, etc.)
- Regression/best-fit algorithm depends on the lab (least-squares for linear, etc.)
- Student estimate input (e.g., text field for k) triggers comparison display
- Feedback is immediate and visual (color + percent difference)
- Chart and analysis logic can be reused across labs; customize the label, units, and reference value

---

### 5. Konkludér (Conclude)
**Pedagogical purpose:** Reflection, synthesis, connection to broader concepts

**What happens:**
- Students write a written reflection on their findings
- Guided prompts help them articulate what they learned
- A model answer or expected conclusion is revealed (button: "Vis forventet svar")
- Students compare their thinking to the model answer
- Prompts may ask about real-world applications, error sources, or limitations of the model

**Guided mode scaffolding:**
- Multiple specific questions, each with 1–2 sentences of space:
  - "Describe the relationship you discovered between [variables]"
  - "Does your result match the theory? Why or why not?"
  - "What sources of error could explain any difference?"
  - "In what real-world contexts does this principle apply?"
- Model answer for each question

**Semi-guided scaffolding:**
- One or two main prompts
- 1–2 hints per prompt
- Compact model answer

**Open inquiry scaffolding:**
- Single open prompt: "Summarize what you discovered"
- Reveal model answer for comparison

**Key principle:** Reflection is explicit. Students articulate their learning and compare it to an expected model answer.

**Implementation notes:**
- Prompts are lab-specific (cannot be fully templated)
- Model answers should be 2–4 sentences (complete but concise)
- "Vis forventet svar" button should not prevent students from preceding; they can skip it
- Reflection text is not validated (students can submit empty or brief responses)
- Optional: store reflection text for teacher review (not yet implemented)

---

### 6. Reportér (Report) — OPTIONAL
**Pedagogical purpose:** Formal scientific writing; synthesis of findings for external audience

**What happens:**
- Students write or compile a formal lab report with standard sections
- Sections may include: Formål (Purpose), Metode (Method), Resultater (Results), Diskussion (Discussion), Konklusion (Conclusion)
- Charts and data tables are embedded
- Model report or rubric is provided for comparison

**Guided mode scaffolding:**
- Detailed template with prompts for each section
- Rubric or checklist of what to include (e.g., "Results should include: raw data table, chart, calculated value of k")
- Examples of well-written sections

**Semi-guided scaffolding:**
- Brief template with prompts
- Hints on structure and content

**Open inquiry scaffolding:**
- Blank document; students write freely

**Key principle:** Report writing is a separate skill from experimental inquiry. It can be optional or deferred.

**Implementation notes:**
- Reportér is **not required** for all labs (design decision per lab)
- If included, it is typically the last phase (after Konkludér)
- Can be lightweight (1 paragraph per section) or formal (full report)
- Not yet implemented; use this design for future development
- Teacher feedback and grading can be integrated here

---

## Scaffolding Modes: Three Levels of Guidance

All phases adapt to three inquiry modes, selectable by the student at the start:

| Mode | Guidance Level | Best For | Cognitive Demand |
|------|---|---|---|
| **Guidet** (Guided) | Heavy scaffolding | Introductory students, first exposure to a concept, struggling learners | Low–Medium |
| **Semi-guidet** (Semi-guided) | Moderate scaffolding | Intermediate students, second or third exposure, mixed confidence | Medium |
| **Åben undersøgelse** (Open inquiry) | Minimal scaffolding | Advanced students, independent learners, follow-up labs | Medium–High |

### Guidance Patterns by Mode

**Guidet mode:**
- Numbered step-by-step instructions
- Sentence starters and templates
- Specific examples (e.g., "Your hypothesis should be: F is directly proportional to x because...")
- Checklists with confirmations
- Explicit warnings about common errors
- Expected answers revealed immediately

**Semi-guidet mode:**
- Brief context and learning objective
- Expandable hint boxes (💡 icon) with additional help
- General guidance without specific templates
- One or two hints per major task
- Model answer available but not shown automatically

**Åben undersøgelse mode:**
- Tools and apparatus only
- No instructions or prompts
- No hints or scaffolding
- Model answer available upon request
- High autonomy; students design their own approach

### Implementation Pattern

```tsx
if (mode === "guidet") {
  // Show numbered steps, sentence starters, checklists, explicit confirmations
} else if (mode === "semi") {
  // Show brief overview + expandable hints (💡 toggles)
} else if (mode === "open") {
  // Show only the tools; no guidance
}
```

---

## Lab-Specific Configuration

Each lab in `content/topics.ts` should define which phases to include and how to configure them:

```typescript
type LabGuideConfig = {
  phases: ("plan" | "setup" | "measure" | "analyze" | "conclude" | "report")[]
  minDataPoints?: number         // Default: 4
  analysisParameter?: string     // What to estimate (e.g., "k (N/m)")
  referenceValue?: number        // Theory or simulation value
  reportRequired?: boolean       // Default: false
}

// Example: Hooke's Law
const hookesLawConfig: LabGuideConfig = {
  phases: ["plan", "setup", "measure", "analyze", "conclude"],
  minDataPoints: 4,
  analysisParameter: "k (N/m)",
  referenceValue: 5,              // Simulation spring constant
  reportRequired: false,
}
```

---

## Reusable Components

As labs are added, the following components become increasingly reusable:

| Component | Status | Customization |
|-----------|--------|---|
| **PlanPhase** | Generic logic + lab-specific prompts | Write lab-specific hypothesis questions |
| **SetupPhase** | Generic logic + lab-specific steps | Write step-by-step instructions for apparatus |
| **MeasurePhase** | Fully generic | Configure column names and validation |
| **AnalyzePhase** | Generic chart logic + lab-specific analysis | Specify chart type, regression method, parameter units |
| **ConcludePhase** | Generic logic + lab-specific prompts | Write reflection questions and model answers |
| **ReportPhase** | Generic template + optional rubric | Configure which sections are required |

---

## Pedagogical Alignment

### Inquiry-Based Learning Cycle
The 6 phases map to the standard inquiry cycle:
1. **Planlæg** = Ask a question, form a hypothesis (Ask & Hypothesize)
2. **Opstil** = Design and prepare the experiment (Design)
3. **Mål** = Conduct the experiment and collect data (Investigate)
4. **Analysér** = Analyze and interpret the data (Analyze & Interpret)
5. **Konkludér** = Draw conclusions and discuss (Conclude & Reflect)
6. **Reportér** = Communicate findings (Communicate)

### Learning Objectives Addressed
- **Knowledge:** Understanding of the physics concept (e.g., Hooke's law)
- **Skills:** Data collection, graphing, quantitative reasoning, scientific writing
- **Attitudes:** Curiosity, persistence, willingness to revise thinking based on data
- **Practices:** Hypothesis formation, error analysis, peer comparison

---

## Guidelines for Lab Designers

When creating a new lab with this template:

1. **Start with the science learning goal.** What concept should students understand by the end?
2. **Design each phase to serve that goal.**
   - Planlæg: What hypothesis or prediction does this test?
   - Opstil: What do students need to do to set up correctly?
   - Mål: What data should they collect? How many trials?
   - Analysér: What should they extract from the data? How does it compare to theory?
   - Konkludér: How should they reflect on the gap between their result and theory?
   - Reportér: Should they write a formal report? (If not, skip this phase.)

3. **Write content for all three modes.** Each mode should be achievable; adjust complexity, not rigor.
4. **Test the lab with the three modes.** Run through as "Guidet," "Semi," and "Åben." Ensure all three paths lead to the same learning outcome.
5. **Provide a model answer for Konkludér.** It should be realistic (2–4 sentences), not a textbook answer.
6. **Iterate based on student feedback.** After the first cohort, gather feedback on which mode was most effective and which instructions were unclear.

---

## Future Extensions

- **Phase 7: Sammenligng** (Comparison) — Compare your result to peer results; discuss why differences exist
- **Mode: Pair-guided** — One student is the experimentalist, the other is the "coach" (reads instructions and guides)
- **Data sharing** — Submit your data to a class dataset; analyze patterns across all student experiments
- **Scaffolding levels beyond 3** — e.g., video tutorials, interactive simulations of the procedure before the real thing

---

## Version History
- **v1.0** (2026-04-30) — Initial design with 6 phases, 3 scaffolding modes, lab-specific configuration
