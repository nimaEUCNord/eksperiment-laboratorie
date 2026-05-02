import type { Topic } from "@/content/types";
import { bevarelseMekaniskEnerg } from "./bevarelse-af-mekanisk-energi";
import { energiomsaetningPaaSkraaplan } from "./energiomsaetning-paa-skraaplan";
import { effektOgNyttevirkning } from "./effekt-og-nyttevirkning";
import { kinetiskEnergiOgFart } from "./kinetisk-energi-og-fart";

export const energi: Topic = {
  slug: "energi",
  title: "Energi",
  tagline: "Arbejde, energiformer og effekt",
  description:
    "Energi kan hverken opstå eller forsvinde – kun omsættes fra én form til en anden. I dette emne ser vi på mekanisk energi, arbejde, effekt og virkningsgrad gennem forsøg, hvor vi følger energien fra start til slut.",
  accentColor: "emerald",
  labs: [bevarelseMekaniskEnerg, energiomsaetningPaaSkraaplan, effektOgNyttevirkning, kinetiskEnergiOgFart],
};
