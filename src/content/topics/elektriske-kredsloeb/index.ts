import type { Topic } from "@/content/types";
import { ohmsLov } from "./ohms-lov";
import { serieOgParallelkreds } from "./serie-og-parallelkreds";
import { kondensatorOpladning } from "./kondensator-opladning";
import { indreModstand } from "./indre-modstand";

export const elektriskeKredsloeb: Topic = {
  slug: "elektriske-kredsloeb",
  title: "Elektriske Kredsløb",
  tagline: "Strøm, spænding og resistans",
  description:
    "Et elektrisk kredsløb er en lukket sti for ladninger. I dette emne bygger vi simple kredsløb, måler strøm og spænding, og finder de regler, der styrer, hvordan energi flyder gennem komponenterne.",
  accentColor: "amber",
  labs: [ohmsLov, serieOgParallelkreds, kondensatorOpladning, indreModstand],
};
