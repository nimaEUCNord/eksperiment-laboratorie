import type { Topic } from "@/content/types";
import { skraatKast } from "./skraat-kast";
import { newtons2Lov } from "./newtons-2-lov";
import { bevaegelsesmaengdeOgStoed } from "./bevaegelsesmaengde-og-stoed";
import { penduletsSvingningstid } from "./pendulets-svingningstid";

export const mekanik: Topic = {
  slug: "mekanik",
  title: "Mekanik",
  tagline: "Kræfter, bevægelse og acceleration",
  description:
    "Mekanik handler om, hvordan ting bevæger sig, og hvilke kræfter der får dem til at bevæge sig. Her undersøger vi alt fra et frit fald til pendulets svingninger gennem forsøg og simulationer.",
  accentColor: "sky",
  labs: [skraatKast, newtons2Lov, bevaegelsesmaengdeOgStoed, penduletsSvingningstid],
};
