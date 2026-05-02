import type { Topic } from "@/content/types";
import { emissionsspektrum } from "./emissionsspektrum";
import { fotoelektriskEffekt } from "./fotoelektrisk-effekt";
import { halveringstid } from "./halveringstid";
import { roentgenEnerg } from "./roentgen-energi";

export const atomfysik: Topic = {
  slug: "atomfysik",
  title: "Atomfysik",
  tagline: "Atomer, fotoner og henfald",
  description:
    "På atomare skala opfører naturen sig kvantiseret – energi kommer i pakker. Vi udforsker emissionsspektre, den fotoelektriske effekt og radioaktivt henfald.",
  accentColor: "rose",
  labs: [emissionsspektrum, fotoelektriskEffekt, halveringstid, roentgenEnerg],
};
