import type { Topic } from "./types";

export const topics: Topic[] = [
  {
    slug: "mekanik",
    title: "Mekanik",
    tagline: "Kræfter, bevægelse og acceleration",
    description:
      "Mekanik handler om, hvordan ting bevæger sig, og hvilke kræfter der får dem til at bevæge sig. Her undersøger vi alt fra et frit fald til pendulets svingninger gennem forsøg og simulationer.",
    accentColor: "sky",
    labs: [
      {
        slug: "skraat-kast",
        title: "Skråt kast",
        shortDescription:
          "Undersøg hvordan startvinkel og starthastighed bestemmer kastets længde og højde.",
        goal:
          "At forstå hvordan en genstands bane afhænger af startvinkel og starthastighed, og at kunne forudsige kastelængde, maksimal højde og flyvetid ud fra teorien.",
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
      },
      {
        slug: "hookes-lov",
        title: "Hookes lov",
        shortDescription:
          "Undersøg hvordan en fjederkraft afhænger af forlængelsen, og bestem fjederkonstanten k.",
        goal:
          "At eftervise at fjederkraften er proportional med forlængelsen, og at bestemme fjederkonstanten k for en konkret fjeder ud fra målte data.",
        keyConcepts: [
          "Fjederkraft og forlængelse fra ligevægtspositionen",
          "Hookes lov som en lineær sammenhæng mellem F og x",
          "Fjederkonstanten k som mål for fjederens stivhed",
          "Ligevægt mellem fjederkraft og tyngdekraft: k·x = m·g",
        ],
        keyEquation: "F = −k · x",
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
        inquiry: true,
      },
      {
        slug: "newtons-2-lov",
        title: "Newtons 2. lov",
        shortDescription:
          "Mål sammenhængen mellem kraft, masse og acceleration på en vogn på en luftpude.",
        simulationId: "newtons-2-lov",
      },
      {
        slug: "bevaegelsesmaengde-og-stoed",
        title: "Bevægelsesmængde og stød",
        shortDescription:
          "Studér elastiske og uelastiske stød mellem to vogne og bevarelsen af bevægelsesmængde.",
        simulationId: "stoed",
      },
      {
        slug: "pendulets-svingningstid",
        title: "Pendulets svingningstid",
        shortDescription:
          "Bestem hvordan længden af et pendul påvirker svingningstiden – og find tyngdeaccelerationen g.",
        simulationId: "pendul",
      },
    ],
  },
  {
    slug: "energi",
    title: "Energi",
    tagline: "Arbejde, energiformer og effekt",
    description:
      "Energi kan hverken opstå eller forsvinde – kun omsættes fra én form til en anden. I dette emne ser vi på mekanisk energi, arbejde, effekt og virkningsgrad gennem forsøg, hvor vi følger energien fra start til slut.",
    accentColor: "emerald",
    labs: [
      {
        slug: "bevarelse-af-mekanisk-energi",
        title: "Bevarelse af mekanisk energi",
        shortDescription:
          "Følg en kugle ned ad en bane og se, hvordan potentiel energi omsættes til kinetisk energi.",
        simulationId: "energi-bevarelse",
      },
      {
        slug: "energiomsaetning-paa-skraaplan",
        title: "Energiomsætning på skråplan",
        shortDescription:
          "Bestem hvor stor en del af energien, der bliver til varme på grund af friktion.",
        simulationId: "skraaplan-energi",
      },
      {
        slug: "effekt-og-nyttevirkning",
        title: "Effekt og nyttevirkning",
        shortDescription:
          "Mål effekten af en lille motor, der løfter en last, og beregn dens virkningsgrad.",
        simulationId: "effekt",
      },
      {
        slug: "kinetisk-energi-og-fart",
        title: "Kinetisk energi og fart",
        shortDescription:
          "Undersøg hvordan en genstands kinetiske energi afhænger af farten – ikke lineært, men kvadratisk.",
        simulationId: "kinetisk-energi",
      },
    ],
  },
  {
    slug: "elektriske-kredsloeb",
    title: "Elektriske Kredsløb",
    tagline: "Strøm, spænding og resistans",
    description:
      "Et elektrisk kredsløb er en lukket sti for ladninger. I dette emne bygger vi simple kredsløb, måler strøm og spænding, og finder de regler, der styrer, hvordan energi flyder gennem komponenterne.",
    accentColor: "amber",
    labs: [
      {
        slug: "ohms-lov",
        title: "Ohms lov",
        shortDescription:
          "Mål strøm og spænding over en resistor og bestem resistansen ud fra grafen.",
        simulationId: "ohms-lov",
      },
      {
        slug: "serie-og-parallelkreds",
        title: "Seriekreds vs. parallelkreds",
        shortDescription:
          "Sammenlign strøm og spænding i seriekoblede og parallelkoblede pærer.",
        simulationId: "kredsloeb",
      },
      {
        slug: "kondensator-opladning",
        title: "Kondensator opladning og afladning",
        shortDescription:
          "Følg spændingen over en kondensator under opladning og bestem tidskonstanten τ = R·C.",
        simulationId: "kondensator",
      },
      {
        slug: "indre-modstand",
        title: "Indre modstand i et batteri",
        shortDescription:
          "Find batteriets indre modstand ved at måle klemspændingen ved forskellige belastninger.",
        simulationId: "indre-modstand",
      },
    ],
  },
  {
    slug: "boelger",
    title: "Bølger",
    tagline: "Frekvens, bølgelængde og interferens",
    description:
      "Bølger transporterer energi gennem rummet uden at flytte stof med sig. Vi undersøger lyd, lys og stående bølger – og ser, hvordan to bølger kan forstærke eller udslukke hinanden.",
    accentColor: "violet",
    labs: [
      {
        slug: "staaende-boelger-paa-streng",
        title: "Stående bølger på en streng",
        shortDescription:
          "Find resonansfrekvenserne for en spændt streng og forbind dem med strengens længde og spænding.",
        simulationId: "staaende-boelger",
      },
      {
        slug: "lydens-hastighed",
        title: "Lydens hastighed",
        shortDescription:
          "Bestem lydens hastighed i luft ved at måle ekkoets løbetid eller resonans i et rør.",
        simulationId: "lydhastighed",
      },
      {
        slug: "brydning-og-refleksion",
        title: "Brydning og refleksion",
        shortDescription:
          "Mål brydningsindekset for et stykke akryl og verificér Snells lov.",
        simulationId: "brydning",
      },
      {
        slug: "dobbeltspalte",
        title: "Dobbeltspalteforsøget",
        shortDescription:
          "Send laserlys gennem to spalter og se, hvordan interferens danner et stribemønster.",
        simulationId: "dobbeltspalte",
      },
    ],
  },
  {
    slug: "atomfysik",
    title: "Atomfysik",
    tagline: "Atomer, fotoner og henfald",
    description:
      "På atomare skala opfører naturen sig kvantiseret – energi kommer i pakker. Vi udforsker emissionsspektre, den fotoelektriske effekt og radioaktivt henfald.",
    accentColor: "rose",
    labs: [
      {
        slug: "emissionsspektrum",
        title: "Brintatomets emissionsspektrum",
        shortDescription:
          "Mål bølgelængderne i brints synlige spektrum og verificér Rydbergs formel.",
        simulationId: "emission",
      },
      {
        slug: "fotoelektrisk-effekt",
        title: "Den fotoelektriske effekt",
        shortDescription:
          "Bestem Plancks konstant ved at måle stoppespændingen for forskellige lysfrekvenser.",
        simulationId: "fotoelektrisk",
      },
      {
        slug: "halveringstid",
        title: "Halveringstid for radioaktivt henfald",
        shortDescription:
          "Simulér henfald af en radioaktiv kilde og bestem halveringstiden ud fra aktivitetskurven.",
        simulationId: "halveringstid",
      },
      {
        slug: "roentgen-energi",
        title: "Røntgenstråling og energi",
        shortDescription:
          "Beregn fotonenergien for en røntgenkilde ud fra accelerationsspændingen.",
        simulationId: "roentgen",
      },
    ],
  },
  {
    slug: "termodynamik",
    title: "Termodynamik",
    tagline: "Varme, temperatur og energiomsætning",
    description:
      "Termodynamik beskriver, hvordan varme og indre energi flytter sig mellem stoffer. Vi måler varmekapaciteter, blander stoffer ved forskellige temperaturer og ser på gassers opførsel under tryk.",
    accentColor: "orange",
    labs: [
      {
        slug: "specifik-varmekapacitet",
        title: "Specifik varmekapacitet",
        shortDescription:
          "Bestem den specifikke varmekapacitet for et metal ved hjælp af et kalorimeter.",
        simulationId: "varmekapacitet",
      },
      {
        slug: "blandingstemperatur",
        title: "Varmeudveksling og blandingstemperatur",
        shortDescription:
          "Bland varmt og koldt vand og forudsig blandingstemperaturen ud fra energibevarelse.",
        simulationId: "blanding",
      },
      {
        slug: "boyle-mariotte",
        title: "Boyle-Mariottes lov",
        shortDescription:
          "Undersøg sammenhængen mellem tryk og volumen for en gas ved konstant temperatur.",
        simulationId: "boyle",
      },
      {
        slug: "fasovergange",
        title: "Energi ved fasovergange",
        shortDescription:
          "Følg en isterning mens den smelter og opvarmes – og se hvor meget energi en fasovergang koster.",
        simulationId: "fasovergange",
      },
    ],
  },
];
