import type { PhaseIntroContent } from "../components/PhaseIntroBox";

export const DEFAULT_PHASE_INTROS: Record<1 | 2 | 3 | 4 | 5, PhaseIntroContent> = {
  1: {
    heading: "Fase 1 - Planlæg dit forsøg:",
    body: [
      "Identificér de variable du skal arbejde med.",
      "Formulér en hypotese ud fra teorien.",
      "Overvej hvilke målinger der kan be- eller afkræfte hypotesen.",
    ],
  },
  2: {
    heading: "Fase 2 - Opstilling og fremgangsmåde:",
    body: [
      "Saml dine materialer og tjek, at alt er klar.",
      "Gør dig selv bekendt med måleudstyr og målemetoder.",
      "Planlæg hvordan du registrerer data systematisk.",
    ],
  },
  3: {
    heading: "Fase 3 - Dataindsamling:",
    body: "Indsaml et passende antal målinger. Hvis et felt kan beregnes automatisk, udfyldes det af sig selv.",
  },
  4: {
    heading: "Fase 4 - Databehandling",
    body: "Sammenlign dine målinger med den teoretiske værdi.",
  },
  5: {
    heading: "Fase 5 - Konkludér og reflektér:",
    body: [
      "Sammenfat hvad dine målinger viser.",
      "Vurdér hvordan resultatet passer med din hypotese.",
      "Overvej fejlkilder og hvad du ville gøre anderledes en anden gang.",
    ],
  },
};
