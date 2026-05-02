import type { Lab } from "@/content/types";
import { templateForsoegConfig } from "./template-forsog.config";

// Lab with LaTeX equation support
export const templateForsog: Lab = {
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
  observations: [
    "Hypotese: Forudsig, at tyngdekraften stiger lineært med massen. Hvad er dine forventninger til hældningen?",
    "Variable: Du varierer massen, måler eller beregner tyngdekraften, og holder tyngdeaccelerationen konstant.",
    "Dataindsamling: Mål eller beregn tyngdekraften for mindst 5–6 forskellige masser for at få et solidt datasæt.",
    "Analyse: Plot kraft mod masse i et diagram. Tegn en bedste-fit-linje gennem datapunkterne. Hvad er linjens hældning? Sammenhold med den teoretiske værdi g ≈ 9,82 N/kg.",
    "Fejlkilder: Diskuter kilder til usikkerhed (f.eks. måleinstrumentets nøjagtighed, luftmodstand, friktion) og hvordan de påvirker dit resultat.",
  ],
  labGuide: true,
  labGuideConfig: templateForsoegConfig,
};
