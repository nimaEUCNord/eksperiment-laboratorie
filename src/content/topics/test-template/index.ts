import type { Topic } from "@/content/types";
import { templateForsog } from "./template-forsog";

export const testTemplate: Topic = {
  slug: "test-template",
  title: "Skabelon",
  tagline: "Skabelon til nye forsøg",
  description:
    "Dette er et testforsøg, der viser alle sektioner og faser i forsøgene. Bruges som skabelon til at designe nye forsøg.",
  accentColor: "sky",
  labs: [templateForsog],
};
