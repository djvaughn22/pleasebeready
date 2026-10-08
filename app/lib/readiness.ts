// PleaseBeReady checklist content — the single source for the homepage.
//
// Every area links to an official guide. Advice lines restate that guide in
// plain words; do not add a safety claim here that the linked source does not
// make. Gear is optional and lives in gear.ts's affiliate format.

import type { GearItem } from "./gear";

export type Area = {
  id: string;
  emoji: string;
  title: string;
  details: string[];
  href: string;
  source: string;
  gear: GearItem[];
};

export const areas: Area[] = [
  {
    id: "water", emoji: "💧", title: "Water", href: "https://www.ready.gov/water", source: "Ready.gov",
    details: [
      "1 gallon per person per day (drinking + sanitation); don't forget pets.",
      "Store a 3-day minimum; aim for 2 weeks. Rotate store-bought every 6–12 months.",
      "Backup purification: a filter, 1/8 teaspoon of unscented bleach per gallon (wait 30 minutes), or a rolling boil for 1 minute.",
    ],
    gear: [
      { name: "Reliance Aqua-Tainer 7-gallon water container", asin: "B001QC31G6" },
      { name: "LifeStraw personal water filter", asin: "B006QF3TW4" },
    ],
  },
  {
    id: "food", emoji: "🥫", title: "Food", href: "https://www.ready.gov/food", source: "Ready.gov",
    details: [
      "2-week supply of non-perishable, no-cook food — roughly 2,000 calories/person/day.",
      "Canned meat/beans/veg, peanut butter, nuts, dried fruit, crackers, shelf-stable milk.",
      "Keep a manual can opener. Rotate by expiration date.",
    ],
    gear: [
      { name: "Mountain House 3-day emergency food supply", asin: "B0898QSCNG" },
      { name: "Heavy-duty manual can opener", asin: "B09HKDZ3CV" },
    ],
  },
  {
    id: "first-aid", emoji: "🩹", title: "First Aid & Meds", href: "https://www.redcross.org/get-help/how-to-prepare-for-emergencies/survival-kit-supplies.html", source: "Red Cross",
    details: [
      "Stocked first-aid kit + a printed list of everyone's medications and doses.",
      "7–30 day backup of prescriptions where possible.",
      "OTC: pain reliever, antihistamine, anti-diarrheal, electrolytes.",
    ],
    gear: [
      { name: "First Aid Only 298-piece all-purpose kit", asin: "B000069EYA" },
    ],
  },
  {
    id: "power", emoji: "🔦", title: "Power & Light", href: "https://www.ready.gov/power-outages", source: "Ready.gov",
    details: [
      "LED flashlights + headlamps, plenty of spare batteries, 1–2 charged power banks.",
      "NOAA hand-crank / solar radio.",
      "Generators run outdoors only, 20+ ft from windows and doors (carbon monoxide kills).",
    ],
    gear: [
      { name: "Energizer LED headlamps, 2-pack with batteries", asin: "B092RHC2FY" },
      { name: "Anker 10,000mAh USB-C power bank", asin: "B0D5CLSMFB" },
    ],
  },
  {
    id: "heat", emoji: "🔥", title: "Heat & Shelter", href: "https://www.ready.gov/winter-weather", source: "Ready.gov",
    details: [
      "Wool or mylar blankets, sleeping bags rated to your local lows, layered clothing, hand warmers.",
      "Never run a grill, camp stove, or generator indoors.",
      "Working carbon-monoxide detector with fresh batteries.",
    ],
    gear: [
      { name: "Swiss Safe mylar emergency blankets, 4-pack", asin: "B01LYNWRLA" },
      { name: "HotHands hand warmers, 10 pair", asin: "B077RXSZN3" },
    ],
  },
  {
    id: "plan", emoji: "📻", title: "Communication & Plan", href: "https://www.ready.gov/plan", source: "Ready.gov",
    details: [
      "NOAA weather radio + a written contact list (paper, not just your phone).",
      "Pick one out-of-town contact everyone checks in with.",
      "Two meeting spots: near home, and outside the neighborhood. Text over call in outages.",
    ],
    gear: [
      { name: "Midland ER310 hand-crank NOAA weather radio", asin: "B015QIC1PW" },
    ],
  },
  {
    id: "documents", emoji: "📄", title: "Documents & Cash", href: "https://www.ready.gov/financial-preparedness", source: "Ready.gov / FEMA EFFAK",
    details: [
      "Copies of IDs, insurance, deeds/leases, medical + Rx, and contacts.",
      "Keep them in a waterproof bag and in encrypted cloud storage.",
      "Cash in small bills — ATMs and card readers may be down.",
    ],
    gear: [
      { name: "Fireproof, waterproof document bag with lock", asin: "B07SPZ93V5" },
    ],
  },
  {
    id: "go-bag", emoji: "🎒", title: "72-Hour Go-Bag", href: "https://www.ready.gov/kit", source: "Ready.gov",
    details: [
      "One per person, by the door. 3 days of water + no-cook food.",
      "First aid, meds, flashlight, radio, charger, cash, document copies.",
      "Sanitation, change of clothes, sturdy shoes, whistle, emergency blanket.",
    ],
    gear: [
      { name: "Ready America 72-hour kit, 2-person backpack", asin: "B000FJQQVI" },
    ],
  },
  {
    id: "car", emoji: "🚗", title: "Car Kit", href: "https://www.ready.gov/car", source: "Ready.gov",
    details: [
      "Jumper cables, blanket, water, snacks, flashlight, first-aid kit.",
      "Phone charger, small tool kit, ice scraper.",
      "Flares or reflective triangles; keep the tank at least half full.",
    ],
    gear: [
      { name: "Car emergency kit: jumper cables, air compressor, first aid", asin: "B01C96AFWU" },
    ],
  },
  {
    id: "home", emoji: "🏠", title: "Home Safety", href: "https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/fire.html", source: "Red Cross",
    details: [
      "Smoke + CO detectors on every level; test monthly.",
      "Fire extinguisher you know how to use (remember PASS: Pull, Aim, Squeeze, Sweep).",
      "Know how to shut off water, gas, and electricity. Keep two exits clear.",
    ],
    gear: [
      { name: "First Alert HOME1 fire extinguisher", asin: "B01LTICQYE" },
      { name: "First Alert battery smoke + CO combo alarm", asin: "B0CLVRPNZX" },
    ],
  },
  {
    id: "skills", emoji: "🤝", title: "Skills & Community", href: "https://www.ready.gov/cert", source: "FEMA CERT",
    details: [
      "Learn first aid and CPR.",
      "Consider joining a Community Emergency Response Team (CERT).",
      "Know which neighbors have medical, trade, or equipment resources. Practice your plan twice a year.",
    ],
    gear: [
      { name: "Red Cross First Aid/CPR/AED manual", asin: "173674478X" },
    ],
  },
];

export type Level = { tag: string; title: string; text: string; gear: GearItem[] };

export const levels: Level[] = [
  {
    tag: "Level 1", title: "72 Hours",
    text: "The baseline everyone should hit: ride out a storm, outage, or evacuation.",
    gear: [
      { name: "Ready America 72-hour kit, 2-person", asin: "B000FJQQVI" },
    ],
  },
  {
    tag: "Level 2", title: "2 Weeks",
    text: "FEMA's current guidance for many disasters. Water, food, meds, and power for two weeks.",
    gear: [
      { name: "Augason Farms 30-day food supply, 1 person", asin: "B071KPGLBK" },
      { name: "Augason Farms 55-gal water barrel + treatment kit", asin: "B006OW4FVI" },
      { name: "Jackery Explorer 1000 v2 power station", asin: "B0D7PPG25F" },
    ],
  },
  {
    tag: "Level 3", title: "1 Month+",
    text: "Extended resilience for longer disruptions — build here once Levels 1–2 are solid.",
    gear: [
      { name: "Westinghouse 9500W dual-fuel generator (CO sensor)", asin: "B099KPDJBD" },
      { name: "Boroux gravity-fed water filter, 3 gallons", asin: "B0D9WNBTD8" },
      { name: "SentrySafe fireproof + waterproof safe", asin: "B005P12C5A" },
    ],
  },
];

export const resources = [
  { label: "Ready.gov — Build a Kit", href: "https://www.ready.gov/kit" },
  { label: "Ready.gov — Make a Plan", href: "https://www.ready.gov/plan" },
  { label: "FEMA App (alerts + checklists)", href: "https://www.fema.gov/about/news-multimedia/mobile-products" },
  { label: "American Red Cross — Prepare", href: "https://www.redcross.org/get-help/how-to-prepare-for-emergencies.html" },
  { label: "CDC — Readiness and Response", href: "https://www.cdc.gov/orr/index.html" },
];

// ── First-time path: pick a household need → one free step → its checklist ──
//
// Each need's first step paraphrases the guide it links to. Keep them small
// enough to finish today, and never more specific than the source.

export type Need = {
  id: string;
  emoji: string;
  label: string;
  step: { title: string; detail: string; minutes: number };
  guide: { label: string; href: string };
  areaIds: string[];
};

export const needs: Need[] = [
  {
    id: "outage", emoji: "🔦", label: "Power outage",
    step: {
      title: "Test every flashlight tonight",
      detail: "Gather the flashlights and headlamps, put in fresh batteries, and keep one where you can reach it in the dark. Charge your power banks.",
      minutes: 10,
    },
    guide: { label: "Ready.gov — Power Outages", href: "https://www.ready.gov/power-outages" },
    areaIds: ["power", "heat", "food"],
  },
  {
    id: "storm", emoji: "🌪️", label: "Storms & tornadoes",
    step: {
      title: "Pick your shelter spot",
      detail: "Choose a small, interior, windowless room or basement on the lowest level. Walk everyone there once so they know where to go.",
      minutes: 10,
    },
    guide: { label: "Ready.gov — Tornadoes", href: "https://www.ready.gov/tornadoes" },
    areaIds: ["plan", "power", "water"],
  },
  {
    id: "leave", emoji: "🎒", label: "Leaving home fast",
    step: {
      title: "Start one go-bag",
      detail: "Put a bag by the door with water, snacks, a flashlight, a phone charger, and a paper list of everyone's medicines. Add to it over time.",
      minutes: 15,
    },
    guide: { label: "Ready.gov — Evacuation", href: "https://www.ready.gov/evacuation" },
    areaIds: ["go-bag", "documents", "car"],
  },
  {
    id: "water-food", emoji: "💧", label: "Water & food",
    step: {
      title: "Count what you have",
      detail: "Use the supply math below for your household, then check the pantry and the water you already have. Write down the gap.",
      minutes: 10,
    },
    guide: { label: "Ready.gov — Water", href: "https://www.ready.gov/water" },
    areaIds: ["water", "food"],
  },
  {
    id: "meds", emoji: "🩹", label: "Medicines & first aid",
    step: {
      title: "Write down everyone's medicines",
      detail: "On paper, list each person's medicines and doses. Put the list with your first-aid kit and a copy in your go-bag.",
      minutes: 10,
    },
    guide: { label: "Red Cross — Survival Kit Supplies", href: "https://www.redcross.org/get-help/how-to-prepare-for-emergencies/survival-kit-supplies.html" },
    areaIds: ["first-aid", "documents"],
  },
  {
    id: "fire", emoji: "🏠", label: "Home fire safety",
    step: {
      title: "Test every smoke alarm",
      detail: "Press the test button on each smoke alarm. Replace dead batteries now, and set a monthly reminder to test again.",
      minutes: 5,
    },
    guide: { label: "Red Cross — Home Fire Safety", href: "https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/fire.html" },
    areaIds: ["home", "heat"],
  },
  {
    id: "car", emoji: "🚗", label: "Car trouble",
    step: {
      title: "Put three things in the car",
      detail: "A blanket, a few bottles of water, and a phone charger. Then check that the jumper cables are really in the trunk.",
      minutes: 10,
    },
    guide: { label: "Ready.gov — Car Safety", href: "https://www.ready.gov/car" },
    areaIds: ["car"],
  },
  {
    id: "plan", emoji: "📞", label: "Family plan",
    step: {
      title: "Pick one out-of-town contact",
      detail: "Choose one person everyone checks in with, and write their number on paper for each person in the house.",
      minutes: 10,
    },
    guide: { label: "Ready.gov — Make a Plan", href: "https://www.ready.gov/plan" },
    areaIds: ["plan", "skills"],
  },
];

export function areaById(id: string): Area | undefined {
  return areas.find((a) => a.id === id);
}

/** Stable id for a checklist line, used for on-device check marks. */
export function itemId(areaId: string, text: string): string {
  const slug = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
  return `${areaId}:${slug}`;
}

// ── Supply math (Ready.gov: one gallon per person per day) ──

export const GALLONS_PER_PERSON_PER_DAY = 1;

export type SupplyMath = { gallons: number; personDays: number };

export function supplyMath(people: number, days: number): SupplyMath {
  const p = clampInt(people, 1, 20);
  const d = clampInt(days, 1, 30);
  return { gallons: p * d * GALLONS_PER_PERSON_PER_DAY, personDays: p * d };
}

function clampInt(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.round(n)));
}
