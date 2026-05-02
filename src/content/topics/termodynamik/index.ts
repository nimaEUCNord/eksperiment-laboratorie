import type { Topic } from "@/content/types";
import { spesifikVarmekapacitet } from "./specifik-varmekapacitet";
import { blandingstemperatur } from "./blandingstemperatur";
import { boyleMariotte } from "./boyle-mariotte";
import { fasovergange } from "./fasovergange";

export const termodynamik: Topic = {
  slug: "termodynamik",
  title: "Termodynamik",
  tagline: "Varme, temperatur og energiomsætning",
  description:
    "Termodynamik beskriver, hvordan varme og indre energi flytter sig mellem stoffer. Vi måler varmekapaciteter, blander stoffer ved forskellige temperaturer og ser på gassers opførsel under tryk.",
  accentColor: "orange",
  labs: [spesifikVarmekapacitet, blandingstemperatur, boyleMariotte, fasovergange],
};
