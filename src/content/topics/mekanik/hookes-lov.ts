import type { LabConfig } from "@/content/types";

export const hookesLov: LabConfig = {
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
  simulationId: "hookes-lov",
  guide: {
    hypothesis:
      "Det forventes, at forlængelsen x er ligefrem proportional med kraften F, så grafen bliver en ret linje gennem (0, 0). Hældningen er fjederkonstanten k.",
    hypothesisPlaceholder:
      "Min hypotese er, at forlængelsen er direkte proportional med kraften, fordi…",
    validateVariableInputs: true,
    blockOnWrongVariableInputs: false,
    bypassLocks: true,
    minMeasurements: 4,
    suggestedMeasurements: 6,
    variables: [
      {
        name: "Masse",
        type: "independent",
        expectedPhysicalQuantity: "Masse",
        expectedSymbol: "m",
        expectedUnit: ["g", "gram", "kg", "kilogram"],
      },
      {
        name: "Forlængelse",
        type: "dependent",
        expectedPhysicalQuantity: ["Forlængelse", "Strækning"],
        expectedSymbol: ["x", "Δx"],
        expectedUnit: ["mm", "cm", "m"],
      },
      {
        name: "Tyngdeacceleration",
        type: "control",
        expectedPhysicalQuantity: "Tyngdeacceleration",
        expectedSymbol: "g",
        expectedUnit: ["m/s²", "m/s^2", "N/kg"],
      },
    ],
    materials: [
      "Fjeder",
      "Lineal eller målebånd",
      "Lodholder med slidslodder",
      "Stativfod, stativstang og stativmuffe",
    ],
    setupItems: [
      "Jeg har målt fjederens naturlige længde uden belastning (nulpunkt)",
      "Jeg har samlet de materialer, jeg skal bruge: kendt masse, lineal/målebånd, statif",
      "Jeg er klar til at måle forlængelsen ved mindst 5–6 forskellige masser",
      "Jeg ved hvordan jeg aflæser forlængelsen, når fjederen er i ro",
      "Jeg har taget et billede af forsøgsopstillingen",
    ],
    dataCollectionGuidance:
      "Vælg en masse, hæng den på fjederen, vent til systemet er i ro og aflæs forlængelsen. Tag mindst 5–6 målepunkter fordelt fra små til større masser — men ikke så tunge at fjederen deformeres. Kraften F = m·g beregnes ud fra dine masser når grafen tegnes.",
    embedSimulationInPhases: ["opstil", "maal", "analyser"],
    chart: {
      xField: "Forlængelse",
      yField: "Masse",
      xScale: 1 / 1000, // mm → m
      yScale: 9.82 / 1000, // g → N (m·g)
      xLabel: "Forlængelse x (m)",
      yLabel: "Kraft F (N)",
      fitMode: "through-origin",
      slopeSymbol: "k",
      slopeUnit: "N/m",
      minPoints: 4,
    },
    theoreticalValue: 5,
    theoreticalValueUnit: "N/m",
    deviationThreshold: 10,
    reflectionQuestions: [
      "1. Beskriv den sammenhæng, du fandt mellem forlængelse og kraft i dine målinger. Stemmer den overens med Hookes lov (F = k·x)?",
      "2. Hvad målte du som fjederkonstant k for din fjeder? Hvordan sammenligner det med simulationens ideelle værdi på 5,0 N/m?",
      "3. Nævn mindst to mulige fejlkilder i dit forsøg. Hvordan ville de påvirke din måling af k?",
      "4. Giv et eksempel fra hverdagen, hvor Hookes lov og fjederkonstanten k er vigtig.",
    ],
    facit:
      "I forsøget fandt vi, at forlængelsen af fjederen var direkte proportional med den påhængte kraft — og dermed at Hookes lov F = k · x gælder for vores fjeder. Grafen over vores målinger viste en næsten ret linje, og hældningen gav vores fjederkonstant k.\n\nDen målte k var sandsynligvis forskellig fra simulationens ideelle værdi på 5,0 N/m. Det skyldes blandt andet at vores rigtige fjeder har små uregelmæssigheder, at aflæsningen sker mens fjederen stadig svinger en smule, og at der er variation mellem målingerne. Simulationen er en idealiseret model — den virkelige verden er mere kompleks.\n\nHookes lov er vigtig i praksis i bilaffjedringer (hvor man vælger en bestemt k for at få den ønskede køreegenskab), præcisionsvægte (hvor k må være kendt for nøjagtig vejning) og mange andre tekniske anvendelser.",
  },
};
