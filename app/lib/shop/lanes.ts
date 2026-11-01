// Shopping lanes: sixteen ways into one catalog. A lane is a rule over catalog
// fields (category, situation, who it serves) plus a few hand-picked ids, so
// one item can sit in several lanes without a second copy of it.

import { CONVENIENCE_TIER, ESSENTIALS, byPrep, prepTier } from "./priority";
import { catalog, occasions } from "../stockup/catalog";
import type { CatalogItem, CategoryId, Need, OccasionId } from "../stockup/types";

export type LaneId =
  | "emergency" | "food-and-water" | "home" | "family" | "school-and-sports" | "pets"
  | "car" | "travel" | "outdoors" | "parties" | "health" | "caregiving"
  | "seasonal" | "moving" | "tools" | "everyday";

export type Lane = {
  id: LaneId;
  emoji: string;
  title: string;
  /** One plain line under the title. */
  blurb: string;
  /** Top border color on cards. Never red. */
  color: string;
  /** Every product in these categories. */
  cats: CategoryId[];
  /** Must-have and useful products suggested for these situations. */
  occs: OccasionId[];
  /** Products for these people. */
  needs?: Need[];
  /** Hand-picked extras. */
  ids?: string[];
  /** Items the rules would pull in that don't belong here (they still sit in another lane). */
  exclude?: string[];
  /** Rank with the shared preparedness order (priority.ts) instead of categories. */
  prep?: boolean;
  /** Categories in order of importance here, when the lane's own `cats` order isn't enough. */
  order?: CategoryId[];
  /** Hand-ranked products to lead the lane with (always in the lane). */
  featured?: string[];
};

export const lanes: Lane[] = [
  { id: "emergency", emoji: "🔦", title: "Emergency preparedness", blurb: "Water, light, power, first aid and a go-bag for storms and outages.", color: "#F97316",
    cats: ["safety", "power"], occs: ["emergency", "outage", "hurricane", "wildfire", "flood"],
    // The store's shared preparedness order (priority.ts): its Essentials lead, everything else by tier.
    // Category sections follow the same tiers.
    prep: true, featured: ESSENTIALS,
    order: ["water", "food", "cooking", "power", "health", "toiletries", "paper", "cleaning", "safety", "sleep", "weather", "tools", "outdoors", "car", "travel"] },
  { id: "food-and-water", emoji: "💧", title: "Food and water", blurb: "Drinking water, storage and a pantry that lasts.", color: "#38BDF8",
    cats: ["water", "food", "drinks"], occs: [] },
  { id: "home", emoji: "🏠", title: "Home essentials", blurb: "The things every house runs out of.", color: "#60A5FA",
    cats: ["cleaning", "paper", "cooking"], occs: ["home"],
    exclude: ["camp-stove", "propane-canisters", "portable-grill", "grill-tools", "camp-cookware-set", "coffee-maker-for-camp", "charcoal"] },
  { id: "family", emoji: "🧸", title: "Family and children", blurb: "Babies, kids, sleepovers and family days.", color: "#E879F9",
    cats: ["baby"], occs: ["newbaby", "sleepover"], needs: ["kids", "babies"],
    exclude: ["soda-or-sparkling-water", "guest-towels", "charging-cables", "headlamps"] },
  { id: "school-and-sports", emoji: "⚽", title: "School and sports", blurb: "School supplies, game days and tournament weekends.", color: "#FBBF24",
    cats: ["school"], occs: ["school", "sports"] },
  { id: "pets", emoji: "🐾", title: "Pets", blurb: "Everyday supplies, travel and a pet go-kit.", color: "#A78BFA",
    cats: ["pets"], occs: ["petprep"], needs: ["pets"] },
  { id: "car", emoji: "🚙", title: "Cars and roadside", blurb: "What lives in the car, for flat tires, dead batteries and winter.", color: "#22D3EE",
    cats: ["car"], occs: ["vehicle"] },
  { id: "travel", emoji: "🧳", title: "Travel and vacations", blurb: "Packing for flights, road trips and the beach.", color: "#38BDF8",
    cats: ["travel"], occs: ["roadtrip", "vacation", "beach"],
    featured: ["car-emergency-kit", "reusable-water-bottles", "power-bank", "charging-cables", "sunscreen", "hand-sanitizer", "motion-sickness-relief", "cooler"],
    exclude: ["hot-dogs", "hot-dog-buns", "portable-grill", "cutting-board-and-knife"] },
  { id: "outdoors", emoji: "⛺", title: "Camping and outdoors", blurb: "Tents, camp kitchens, hikes and days outside.", color: "#7DD3FC",
    cats: ["outdoors", "sleep"], occs: ["camping", "hiking"], ids: ["charcoal", "coffee-maker-for-camp"] },
  { id: "parties", emoji: "🎉", title: "Parties and entertaining", blurb: "Birthdays, cookouts, game days and guests.", color: "#E879F9",
    cats: ["party", "dining", "fun"], occs: ["party", "hosting", "tailgate", "picnic"], ids: ["charcoal"],
    exclude: ["laundry-detergent", "shampoo-and-body-wash", "toothbrushes", "toothpaste", "deodorant", "feminine-hygiene-supplies", "pain-and-fever-reliever",
      "allergy-medicine", "children-s-pain-and-fever-reliever", "facial-tissues", "hand-soap", "contact-lens-supplies-or-spare-glasses", "meds", "baby-food-and-formula", "pasta"] },
  { id: "health", emoji: "🩹", title: "Health and hygiene", blurb: "First aid, sick days and the bathroom shelf.", color: "#60A5FA",
    cats: ["health", "toiletries"], occs: ["sick"],
    exclude: ["frozen-vegetables", "frozen-meals", "guest-towels", "bath-towels", "shower-caddy", "shower-shoes"] },
  { id: "caregiving", emoji: "🤝", title: "Aging parents and caregiving", blurb: "Safer bathrooms, medicines and staying in touch.", color: "#C4B5FD",
    cats: ["access"], occs: ["caregiving"], needs: ["older", "mobility", "medical"] },
  { id: "seasonal", emoji: "🌦️", title: "Seasonal preparation", blurb: "Winter storms, heat waves, hurricane season and smoke.", color: "#FBBF24",
    cats: ["weather"], occs: ["winter", "heat"] },
  { id: "moving", emoji: "📦", title: "Moving and new homes", blurb: "Packing, moving day, a first apartment or a dorm.", color: "#A78BFA",
    cats: ["moving"], occs: ["moving", "college"],
    exclude: ["bike-or-scooter-helmets", "pens", "notebooks", "folders", "boxed-macaroni-and-cheese", "frozen-meals"] },
  { id: "tools", emoji: "🧰", title: "Tools and maintenance", blurb: "A starter tool kit and the jobs every home needs.", color: "#22D3EE",
    cats: ["tools"], occs: [] },
  { id: "everyday", emoji: "🛒", title: "Everyday convenience", blurb: "Chargers, batteries, bags and the small things that save a trip.", color: "#C4B5FD",
    cats: [], occs: ["work"],
    ids: ["batteries", "aaa-batteries", "coin-cell-batteries-cr2032", "9-volt-batteries", "rechargeable-aa-batteries", "battery-charger", "power-bank",
      "car-phone-charger", "charging-cables", "wall-charger-with-several-ports", "power-strip", "surge-protector", "light-bulbs", "night-light",
      "command-hooks-and-strips", "zip-top-bags", "food-storage-bags", "reusable-water-bottles", "insulated-tumbler", "umbrellas",
      "plastic-grocery-or-tote-bags", "spare-keys", "smart-plug", "zip-ties", "superglue", "sewing-kit", "lint-roller"] },
];

export const laneById = (id: string) => lanes.find((l) => l.id === id);

/** Is this product in the lane? Tasks never are; they live on kit pages and lists. */
export function inLane(item: CatalogItem, lane: Lane): boolean {
  if (item.kind === "task" || lane.exclude?.includes(item.id)) return false;
  if (lane.cats.includes(item.cat)) return true;
  if (lane.ids?.includes(item.id) || lane.featured?.includes(item.id)) return true;
  if (lane.needs && item.needs && lane.needs.includes(item.needs)) return true;
  // Items suggested for (nearly) every situation, like trash bags or diapers, belong to their own category's lane only.
  if (item.occ.length >= occasions.length - 2) return false;
  return item.pri !== "extra" && item.occ.some((o) => lane.occs.includes(o));
}

const memo = new Map<LaneId, CatalogItem[]>();

/** The lane's products in catalog order. */
export function laneItems(lane: Lane): CatalogItem[] {
  let items = memo.get(lane.id);
  if (!items) {
    items = catalog.filter((c) => inLane(c, lane));
    memo.set(lane.id, items);
  }
  return items;
}

// Convenience categories: last in any lane they don't define (no party cups at the top of Emergency).
export const SECONDARY: CategoryId[] = ["dining", "party", "fun", "drinks"];
const PRI = { essential: 0, useful: 1, extra: 2 } as const;

/** Category importance in a lane: its `order`, then its own `cats`, then everything else, convenience last. */
export function catRank(lane: Lane, cat: CategoryId): number {
  const own = [...(lane.order ?? []), ...lane.cats.filter((c) => !lane.order?.includes(c))];
  const i = own.indexOf(cat);
  if (i >= 0) return i;
  return SECONDARY.includes(cat) ? 200 : 100;
}

/** Is this a convenience item in this lane (not one of the things the lane is about)? */
export const isSecondary = (item: CatalogItem, lane: Lane) =>
  lane.prep ? prepTier(item) >= CONVENIENCE_TIER : catRank(lane, item.cat) >= 200;

/** Lane order: most important category first, then must-haves, then exact products before searches. */
export function laneSort(lane: Lane, items: CatalogItem[], hasPick: (id: string) => boolean): CatalogItem[] {
  if (lane.prep) return byPrep(items).map((x, i, all) => ({ x, i, all })).sort((a, b) =>
    // Same tier: exact products before searches; otherwise the shared order.
    prepTier(a.x) - prepTier(b.x) || (hasPick(a.x.id) ? 0 : 1) - (hasPick(b.x.id) ? 0 : 1) || a.i - b.i).map((e) => e.x);
  const key = (i: CatalogItem) => catRank(lane, i.cat) * 10 + PRI[i.pri] * 2 + (hasPick(i.id) ? 0 : 1);
  return [...items].sort((a, b) => key(a) - key(b));
}

/** The lane's featured exact products: its hand-ranked list, else one per own category in importance
 * order and round again; other categories only to fill the row, convenience never. */
export function laneFeatured(lane: Lane, hasPick: (id: string) => boolean, n = 8): CatalogItem[] {
  const items = laneItems(lane).filter((i) => hasPick(i.id));
  if (lane.featured) return lane.featured.map((id) => items.find((i) => i.id === id)).filter((i): i is CatalogItem => !!i).slice(0, n);
  const own = (i: CatalogItem) => catRank(lane, i.cat) < 100 || !!lane.ids?.includes(i.id);
  const ranked = laneSort(lane, items.filter((i) => own(i) && i.pri !== "extra"), hasPick);
  const out: CatalogItem[] = [];
  for (let round = 0; out.length < n && round < 6; round++) {
    const seen = new Set<string>();
    for (const i of ranked) {
      if (out.length >= n) break;
      // Each round takes the next item from every category, so one category can't fill the row.
      if (out.includes(i) || seen.has(i.cat) || ranked.filter((x) => x.cat === i.cat).indexOf(i) !== round) continue;
      seen.add(i.cat);
      out.push(i);
    }
  }
  const fill = laneSort(lane, items.filter((i) => !own(i) && !isSecondary(i, lane) && i.pri !== "extra"), hasPick);
  return [...out, ...fill].slice(0, n);
}

/** The lanes an item shows up in. */
export const lanesFor = (item: CatalogItem) => lanes.filter((l) => inLane(item, l));
