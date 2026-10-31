// Our checked products: one exact Amazon product per entry, by ASIN.
//
// Rules:
//  - Only ASINs that already live in readiness.ts gear. Each was title-checked
//    on its amazon.com/dp page before it shipped (an HTTP 200 alone is not a
//    check; stale listings get reused for other products).
//  - `checked` is the last title check we can vouch for, as an ISO date. Leave
//    it out rather than guess.
//  - Names and reasons are our own words. No prices, ratings, stock or claims
//    copied from Amazon.
//  - Everything else in the catalog opens a tagged Amazon search instead, and
//    says so.

export type Tier = "budget" | "standard" | "upgrade";

export type Pick = {
  asin: string;
  /** Brand and model, in our words. */
  name: string;
  /** The catalog item this product fills. */
  item: string;
  tier: Tier;
  /** One plain line on why this one. */
  why: string;
  checked?: string;
};

export const tierText: Record<Tier, string> = { budget: "Budget", standard: "Standard", upgrade: "Upgrade" };

export const picks: Pick[] = [
  { asin: "B001QC31G6", item: "water-storage-container", tier: "standard", name: "Reliance Aqua-Tainer 7-gallon water container", why: "A 7-gallon jug with a spout for storing your own tap water.", checked: "2026-10-30" },
  { asin: "B006OW4FVI", item: "55-gallon-water-barrel", tier: "upgrade", name: "Augason Farms 55-gallon water barrel with treatment kit", why: "One big barrel for long-term water storage at home." },
  { asin: "B006QF3TW4", item: "personal-water-filter", tier: "budget", name: "LifeStraw personal water filter", why: "A light straw filter for a go-bag or a hike." },
  { asin: "B0D9WNBTD8", item: "gravity-water-filter", tier: "upgrade", name: "Boroux gravity-fed water filter, 3 gallons", why: "Filters larger amounts for a household without power." },
  { asin: "B0898QSCNG", item: "3-day-emergency-food-supply", tier: "standard", name: "Mountain House 3-day emergency food supply", why: "Freeze-dried meals in one box. Add water." },
  { asin: "B071KPGLBK", item: "30-day-food-supply", tier: "upgrade", name: "Augason Farms 30-day food supply, 1 person", why: "A month of long-life food for one person in a single order." },
  { asin: "B09HKDZ3CV", item: "manual-can-opener", tier: "budget", name: "Heavy-duty manual can opener", why: "Opens cans when the power is out." },
  { asin: "B000069EYA", item: "first-aid-kit", tier: "standard", name: "First Aid Only 298-piece all-purpose kit", why: "A stocked kit to start from. Add your own medicines." },
  { asin: "173674478X", item: "first-aid-manual", tier: "budget", name: "Red Cross First Aid/CPR/AED manual", why: "The Red Cross manual to keep with the kit." },
  { asin: "B092RHC2FY", item: "headlamps", tier: "budget", name: "Energizer LED headlamps, 2-pack with batteries", why: "Hands-free light for outages, camping and the car." },
  { asin: "B0D5CLSMFB", item: "power-bank", tier: "standard", name: "Anker 10,000mAh USB-C power bank", why: "Pocket-size backup charging for phones." },
  { asin: "B0D7PPG25F", item: "portable-power-station", tier: "upgrade", name: "Jackery Explorer 1000 v2 power station", why: "A large battery for phones, lights and small appliances." },
  { asin: "B099KPDJBD", item: "generator", tier: "upgrade", name: "Westinghouse 9500W dual-fuel generator with CO sensor", why: "Runs on gas or propane. Outdoors only, far from windows and doors." },
  { asin: "B01LYNWRLA", item: "emergency-blankets", tier: "budget", name: "Swiss Safe mylar emergency blankets, 4-pack", why: "Light foil blankets for the car and go-bags." },
  { asin: "B077RXSZN3", item: "hand-warmers", tier: "budget", name: "HotHands hand warmers, 10 pair", why: "Air-activated warmers. No power needed." },
  { asin: "B015QIC1PW", item: "weather-radio", tier: "standard", name: "Midland ER310 hand-crank NOAA weather radio", why: "Weather alerts, plus hand-crank and solar charging.", checked: "2026-10-30" },
  { asin: "B07SPZ93V5", item: "document-bag", tier: "budget", name: "Fireproof, waterproof document bag with lock", why: "Keeps copies of IDs and papers together, ready to grab." },
  { asin: "B005P12C5A", item: "fireproof-safe", tier: "upgrade", name: "SentrySafe fireproof and waterproof safe", why: "A home safe for papers and small valuables." },
  { asin: "B000FJQQVI", item: "72-hour-kit", tier: "standard", name: "Ready America 72-hour kit, 2-person backpack", why: "A packed go-bag for two people to build on." },
  { asin: "B01C96AFWU", item: "car-emergency-kit", tier: "standard", name: "Car emergency kit with jumper cables, air compressor and first aid", why: "The roadside basics in one bag for the trunk." },
  { asin: "B01LTICQYE", item: "fire-extinguisher", tier: "standard", name: "First Alert HOME1 fire extinguisher", why: "A home extinguisher for the kitchen or garage." },
  { asin: "B0CLVRPNZX", item: "smoke-and-co-alarm", tier: "standard", name: "First Alert battery smoke and CO combo alarm", why: "One battery alarm for smoke and carbon monoxide." },
];

const byAsin = new Map(picks.map((p) => [p.asin, p]));
const byItem = new Map(picks.map((p) => [p.item, p]));

export const pickByAsin = (asin: string) => byAsin.get(asin);
export const pickForItem = (itemId: string) => byItem.get(itemId);
