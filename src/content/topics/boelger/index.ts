import type { Topic } from "@/content/types";
import { staaendeBoelgerPaaStreng } from "./staaende-boelger-paa-streng";
import { lydenHastighed } from "./lydens-hastighed";
import { brydningOgRefleksion } from "./brydning-og-refleksion";
import { dobbeltspalte } from "./dobbeltspalte";

export const boelger: Topic = {
  slug: "boelger",
  title: "Bølger",
  tagline: "Frekvens, bølgelængde og interferens",
  description:
    "Bølger transporterer energi gennem rummet uden at flytte stof med sig. Vi undersøger lyd, lys og stående bølger – og ser, hvordan to bølger kan forstærke eller udslukke hinanden.",
  accentColor: "violet",
  labs: [staaendeBoelgerPaaStreng, lydenHastighed, brydningOgRefleksion, dobbeltspalte],
};
