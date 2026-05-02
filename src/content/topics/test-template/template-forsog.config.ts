import type { LabGuideConfig } from "@/content/types";

export const templateForsoegConfig: LabGuideConfig = {
  type: "generic",
  hypothesis: "Det forventes, at tyngdekraften er ligefrem proportional med massen og at hældningstallet er lig med tyngdeaccelerationen $g=9,82 m/s^2",
  hypothesisPlaceholder: "Det forventes, at ... og at hældningstallet bliver ...",
  validateVariableInputs: true,
  blockOnWrongVariableInputs: true,
  variables: [
    {
      name: "Uafhængig variabel",
      type: "independent",
      unit: "enhed",
      expectedPhysicalQuantity: "Masse",
      expectedSymbol: "m",
      expectedUnit: ["kg", "g", "kilogram", "gram"],
    },
    {
      name: "Afhængig variabel",
      type: "dependent",
      unit: "enhed",
      expectedPhysicalQuantity: ["Kraft", "Tyngdekraft"],
      expectedSymbol: ["F", "F_t"],
      expectedUnit: ["N", "newton", "Newton"],
    },
    {
      name: "Kontrolvariabel",
      type: "control",
      unit: "enhed",
      expectedPhysicalQuantity: "Tyngdeacceleration",
      expectedSymbol: "g",
      expectedUnit: ["m/s²", "m/s^2", "N/kg"],
    },
  ],
  measurementFields: [
    { label: "Måling 1", unit: "enheder", autoCalculate: false },
    { label: "Måling 2", unit: "enheder", autoCalculate: false },
    { label: "Beregnet værdi", unit: "enheder", autoCalculate: true, formula: "m1 * m2" },
  ],
  theoreticalValue: 25,
  deviationThreshold: 10,
  reflectionQuestions: [
    "1. Stemmer dine resultater overens med hypotesen? Beskriv hvilke mønstre du observerede.",
    "2. Beregn eller aflæs nøgleparametren ud fra dine data. Hvordan sammenligner det med den teoretiske værdi?",
    "3. Hvilke mulige fejlkilder kunne påvirke dit forsøg? Hvordan ville de ændre resultaterne?",
    "4. Hvis du skulle gentage forsøget, hvad ville du gøre anderledes for at forbedre præcisionen?",
  ],
  facit: "En velgennemført analyse sammenligner systematisk observerede data med teoretiske forudsigelser, og vurderer pålidelighed gennem fejlkildeanalyse.",
};
