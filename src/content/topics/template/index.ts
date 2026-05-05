import type { Topic } from "@/content/types";
import { templateLab } from "./template-lab";

export const template: Topic = {
  slug: "template",
  title: "Skabelon",
  tagline: "Skabelon til nye forsøg",
  description:
    "Dette er et testforsøg, der viser alle sektioner og faser i forsøgene. Bruges som skabelon til at designe nye forsøg.",
  accentColor: "sky",
  labs: [templateLab],
};
