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
  title: "Template forsøg",
  shortDescription: "Viser alle sektion og 6-fase struktur med generisk guide",
  goal: "At undersøge sammenhængen mellem masse og tyngdekraft, og bestemme tyngdeaccelerationen ud fra data",
  keyConcepts: [
    "Tyngdekraft",
    "Lineær sammenhæng mellem masse og kraft",
    "Tyngdeacceleration som hældning",
  ],
  keyEquation: "F_t = m \\cdot g",
  theory: [
    "Når en genstand påvirkes af tyngdekraften, oplever den en kraft kaldet tyngdekraften eller vægten. Denne kraft er direkte proportional med genstandes masse. Proportionalitetskonstanten er tyngdeaccelerationen (ca. 9,82 m/s²). Med andre ord: hvis du fordobler massen, fordobles også tyngdekraften.",
    "Når du plotter en graf med masse på x-aksen og kraft på y-aksen, vil datapunkterne ligge på en ret linje gennem oprindelsen. Linjens hældning svarer præcis til tyngdeaccelerationen. Ved at måle masser og deres tilhørende kræfter kan du altså eksperimentelt bestemme tyngdeaccelerationen fra hældningen af din bedste-fit-linje.",
  ],
  guide: {
    hypothesis:
      "Det forventes, at tyngdekraften er ligefrem proportional med massen og at hældningstallet er lig med tyngdeaccelerationen $g=9,82 m/s^2$",
    hypothesisPlaceholder: "Det forventes, at ... og at hældningstallet bliver ...",
    validateVariableInputs: true,
    blockOnWrongVariableInputs: false,
    blockOnMissingConstants: true,
    bypassLocks: true,
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
    theoreticalValue: 25,
    deviationThreshold: 10,
    reflectionQuestions: [
      "1. Stemmer dine resultater overens med hypotesen? Beskriv hvilke mønstre du observerede.",
      "2. Beregn eller aflæs nøgleparametren ud fra dine data. Hvordan sammenligner det med den teoretiske værdi?",
      "3. Hvilke mulige fejlkilder kunne påvirke dit forsøg? Hvordan ville de ændre resultaterne?",
      "4. Hvis du skulle gentage forsøget, hvad ville du gøre anderledes for at forbedre præcisionen?",
    ],
    facit: "En velgennemført analyse sammenligner systematisk observerede data med teoretiske forudsigelser, og vurderer pålidelighed gennem fejlkildeanalyse.",
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
