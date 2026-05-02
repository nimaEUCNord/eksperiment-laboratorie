import type { Lab } from "@/content/types";

export const hookesLov: Lab = {
  slug: "hookes-lov",
  title: "Hookes lov",
  shortDescription:
    "Undersøg hvordan en fjederkraft afhænger af forlængelsen, og bestem fjederkonstanten k.",
  goal: "At eftervise at fjederkraften er proportional med forlængelsen, og at bestemme fjederkonstanten k for en konkret fjeder ud fra målte data.",
  keyConcepts: [
    "Fjederkraft og forlængelse fra ligevægtspositionen",
    "Hookes lov som en lineær sammenhæng mellem F og x",
    "Fjederkonstanten k som mål for fjederens stivhed",
    "Ligevægt mellem fjederkraft og tyngdekraft: k·x = m·g",
  ],
  keyEquation: "F = -kx",
  theory: [
    "Hookes lov siger, at den kraft, en fjeder trækker tilbage med, er proportional med, hvor meget fjederen er forlænget eller sammenpresset i forhold til sin naturlige længde. Matematisk skrives det F = −k·x, hvor x er forlængelsen og k er fjederkonstanten. Minustegnet betyder, at kraften altid peger mod ligevægtspositionen — fjederen vil tilbage til sin naturlige længde.",
    "Fjederkonstanten k måles i N/m og fortæller, hvor stiv fjederen er. Stor k betyder, at man skal trække hårdt for bare at få en lille forlængelse. Hænger man en kendt masse m i fjederen, indstiller systemet sig i ligevægt, hvor fjederkraften netop balancerer tyngdekraften: k·x = m·g, og derfor x = m·g / k.",
    "Hookes lov gælder kun, så længe fjederen ikke trækkes ud over sit elastiske område. Bliver belastningen for stor, bliver fjederen plastisk deformeret, og lineariteten brydes. I forsøget udnytter vi den lineære del til at finde k som hældningen af en (x, F)-graf.",
  ],
  observations: [
    "Mål fjederens naturlige længde uden belastning, så I har et nulpunkt at regne forlængelser ud fra.",
    "Hæng forskellige kendte masser i fjederen og notér forlængelsen x for hver belastning. Tag mindst 5–6 målepunkter fordelt over fjederens arbejdsområde.",
    "Tegn en graf med kraften F = m·g på y-aksen og forlængelsen x på x-aksen. Hvis Hookes lov gælder, ligger punkterne på en ret linje gennem (0, 0).",
    "Bestem fjederkonstanten k som linjens hældning og sammenlign med den værdi, der står på fjederen — eller med en alternativ målemetode som svingningstid.",
    "Læg mærke til, om grafen begynder at krumme ved store belastninger. Det er signal om, at fjederen er ved at blive trukket ud over sit elastiske område.",
  ],
  simulationId: "hookes-lov",
  labGuide: true,
};
