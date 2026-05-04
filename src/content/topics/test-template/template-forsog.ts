import type { LabConfig } from "@/content/types";
import linealImg from "@/assets/images/equipment/template-forsog/lineal.webp";
import digitalvaegImg from "@/assets/images/equipment/template-forsog/digitalvaegt.webp";
import newtonmeterImg from "@/assets/images/equipment/template-forsog/newtonmeter.webp";
import slidslodderImg from "@/assets/images/equipment/template-forsog/slidslodder10x10g.webp";
import stativfodImg from "@/assets/images/equipment/template-forsog/stativfod.webp";
import stativstangImg from "@/assets/images/equipment/template-forsog/Stativstang.webp";
import stativmuffeImg from "@/assets/images/equipment/template-forsog/stativmuffe.webp";

export const templateForsog: LabConfig = {
  slug: "template-forsog",
  title: "Testforsøg",
  shortDescription: "Viser alle sektion og 6-fase struktur med generisk guide",
  goal: "At undersøge sammenhængen mellem masse og tyngdekraft, og bestemme tyngdeaccelerationen ud fra data",
  keyConcepts: [
    "Tyngdekraft og vægt",
    "Sammenhæng mellem masse og kraft",
    "Eksperimentel bestemmelse af tyngdeaccelerationen",
  ],
  keyEquation: "F_t = m \\cdot g",
  simulationId: "template-forsog",
  theory: [
    "Et lod, med massen $m$, der hænger i et dynamometer, er påvirket af Jordens tyngdekraft $F_t$. Når loddet hænger stille, måler dynamometeret en kraft, der er lige så stor som tyngdekraften på loddet. Denne kraft kaldes også loddets vægt.", "Der er en direkte proportionalitet mellem tyngdekraften og massen. Sammenhængen kan skrives som $$F_t = m \\cdot g$$ hvor kraften måles i newton, $\\mathrm{N}$, og massen måles i kilogram, $\\mathrm{kg}$. Proportionalitetskonstanten $g$ kaldes tyngdeaccelerationen. I Danmark er  den ca. $9,82$ $\\mathrm{m/s^2}$.","I forsøget tilføjes forskellige masser til dynamometeret, og den tilhørende kraft aflæses. Når resultaterne afbildes i en graf med massen på $x$-aksen og kraften på $y$-aksen, forventes målepunkterne at ligge tæt på en ret linje gennem begyndelsespunktet. Linjens hældning svarer til tyngdeaccelerationen $g$. Derfor kan tyngdeaccelerationen bestemmes eksperimentelt ved at finde hældningen af den bedste rette linje gennem målepunkterne.",
  ],
  guide: {
    hypothesis:
      "Det forventes, at tyngdekraften er ligefrem proportional med massen og at hældningstallet er lig med tyngdeaccelerationen $g=9,82 m/s^2$",
    hypothesisPlaceholder: "Fx. Det forventes, at ... og at hældningstallet bliver ...",
    hypothesisKeywords: ["masse", "kraft"],
    hypothesisHints: [
      "Hvilke to fysiske størrelser undersøger du sammenhængen mellem? Og hvad forventer du vil ske?",
      "Tænk på hvilken betydning loddet har. Hvad ændrer sig når loddet ændres?",
      "Brug ordene \"masse\" og \"kraft\" i din hypotese, fx \"Det forventes at kraften vil... når... \".",
      "**placeholderHint**",
    ],
    validateHypothesis: true,
    blockOnWrongHypothesis: true,
    variableHints: [
      "Husk det du læste i teoriafsnittet.",
      "Hvad kunne du ændre på i simulationen uafhængigt af andre variable?",
      "Tænk på enhederne: masse måles fx. i kg eller g.",
      "**Mark for helvede...**",
    ],
    validateVariableInputs: true,
    blockOnWrongVariableInputs: true,
    blockOnMissingConstants: true,
    bypassLocks: false,
    minMeasurements: 4,
    suggestedMeasurements: 6,
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
    theoreticalValue: 9.82,
    deviationThreshold: 1,
    reflectionQuestions: [
      "1. Stemmer dine resultater overens med hypotesen? Beskriv hvilke mønstre du observerede.",
      "2. Beregn eller aflæs nøgleparametren ud fra dine data. Hvordan passer det med den teoretiske værdi?",
      "3. Hvilke mulige fejlkilder kunne påvirke dit forsøg? Hvordan ville de ændre resultaterne?",
      "4. Hvis du skulle gentage forsøget, hvad ville du gøre anderledes for at forbedre præcisionen?",
    ],
    facit: "**PlaceholderText**",
    materials: [
      "Lineal",
      "Digitalvægt, 0.1 g",
      "Dynamometer, 2 N",
      "Lodholder med slidslodder 10 x 10 g",
      "Stativfod",
      "Stativstang",
      "Stativmuffe",
    ],
    materialImages: {
      "Lineal": linealImg,
      "Digitalvægt, 0.1 g": digitalvaegImg,
      "Dynamometer, 2 N": newtonmeterImg,
      "Lodholder med slidslodder 10 x 10 g": slidslodderImg,
      "Stativfod": stativfodImg,
      "Stativstang": stativstangImg,
      "Stativmuffe": stativmuffeImg,
    },
  },
};
