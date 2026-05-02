import type { Topic } from "@/content/types";
import { templateForsog } from "./template-forsog";

export const testTemplate: Topic = {
  slug: "test-template",
  title: "Test og Template",
  tagline: "Template til nye forsøg",
  description:
    "Dette er et testforsøg, der viser alle sektioner og den nye generiske 6-fase laboratorieguide. Brug det som skabelon når du designer nye guidede forsøg.",
  accentColor: "sky",
  labs: [templateForsog],
};
