import type { Topic } from "./types";
import { mekanik } from "./topics/mekanik";
import { energi } from "./topics/energi";
import { elektriskeKredsloeb } from "./topics/elektriske-kredsloeb";
import { boelger } from "./topics/boelger";
import { atomfysik } from "./topics/atomfysik";
import { termodynamik } from "./topics/termodynamik";
import { template } from "./topics/template";

export const topics: Topic[] = [
  mekanik,
  energi,
  elektriskeKredsloeb,
  boelger,
  atomfysik,
  termodynamik,
  template,
];
