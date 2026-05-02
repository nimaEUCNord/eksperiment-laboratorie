import type { Lab } from "@/content/types";
import { templateForsoegConfig } from "./template-forsog.config";

// Lab with LaTeX equation support
export const templateForsog: Lab = {
  slug: "template-forsog",
  title: "Template forsøg",
  shortDescription: "Viser alle sektion og 6-fase struktur med generisk guide",
  goal: "At undersøge hvordan $y$ afhænger af $x$",
  keyConcepts: [
    "Lineær model",
    "Uafhængig og afhængig variable",
    "Hældningskoefficient",
  ],
  keyEquation: "F_t = m \\cdot g",
  theory: [
    "En lineær model $$F_t = m \\cdot g$$ bruges, når ændringen i $y$ er proportional med ændringen i $x$. I ligningen angiver $a$ hældningen, altså hvor meget $y$ ændrer sig, når $x$ vokser med 1.",
  ],
  observations: [
    "Formuler din hypotese klart: hvad forventer du at observere?",
    "Identificer dine variable – hvilken ændrer du, hvad måler du, hvad holder du konstant?",
    "Indsaml mindst 4-6 datapunkter for at sikre pålidelig analyse.",
    "Beregn nøgletal ud fra dine data (f.eks. hældning eller konstant).",
    "Sammenlign dine resultater med teorien og diskuter fejlkilder.",
  ],
  labGuide: true,
  labGuideConfig: templateForsoegConfig,
};
