import type { LabConfig } from "@/content/types";

export const skraatKast: LabConfig = {
  kind: "simulation",
  slug: "skraat-kast",
  title: "Skråt kast",
  shortDescription:
    "Undersøg hvordan startvinkel og starthastighed bestemmer kastets længde og højde.",
  goal: "At forstå hvordan en genstands bane afhænger af startvinkel og starthastighed, og at kunne forudsige kastelængde, maksimal højde og flyvetid ud fra teorien.",
  keyConcepts: [
    "Skråt kast som superposition af vandret konstant bevægelse og lodret accelereret bevægelse",
    "Startvinkel θ og starthastighed v₀",
    "Tyngdeacceleration g ≈ 9,82 m/s²",
    "Kastelængde, maksimal højde og flyvetid",
  ],
  theory: [
    "Et skråt kast er en bevægelse i to dimensioner. Den vandrette og den lodrette del af bevægelsen kan analyseres hver for sig: vandret bevæger genstanden sig med konstant hastighed v₀·cos(θ), og lodret er bevægelsen påvirket af tyngdekraften med en konstant acceleration g nedad.",
    "Stedfunktionerne kan derfor skrives som x(t) = v₀·cos(θ)·t og y(t) = v₀·sin(θ)·t − ½·g·t². Når man løser y(t) = 0, finder man flyvetiden T = 2·v₀·sin(θ)/g, og kastelængden bliver R = v₀²·sin(2θ)/g.",
    "Kastelængden er maksimal ved en startvinkel på 45°, men ændrer sig ikke kun med vinklen — den vokser med kvadratet på starthastigheden. Prøv selv: dobler du v₀, firedobles R.",
  ],
  simulationId: "skraat-kast",
};
