// ─────────────────────────────────────────────────────────────────────────────
// SHOES AND BOOTS, COMPARED LIKE TIRES (working name "Tire Meter", Nov 2026).
//
// Tires sold in the US carry a treadwear grade (UTQG). Shoes carry nothing
// like it, so this file never invents one: no score, no rating, no lifespan
// presented as a test result. Every fact below says where it came from (the
// maker, or a named retailer listing of the maker's specs), checked
// 14 November 2026. Anything a source does not publish is left out and the
// page says "Not published".
//
// Miles and price are the shopper's own numbers. The mile ranges are
// starting points the shopper can change, each labelled with its basis.
//
// Start small on purpose: seven products. Grow it only if people use it
// (counted as `footwear_compare` and `shop_click` footwear-* labels).
// ─────────────────────────────────────────────────────────────────────────────

export type Activity = "walk" | "run" | "hike" | "snow" | "work";
export type Surface = "pavement" | "trail" | "wet" | "snow" | "jobsite";

export const ACTIVITIES: { id: Activity; label: string }[] = [
  { id: "walk", label: "Walking" },
  { id: "run", label: "Running" },
  { id: "hike", label: "Hiking" },
  { id: "snow", label: "Snow and ice" },
  { id: "work", label: "Work" },
];

export const SURFACES: { id: Surface; label: string }[] = [
  { id: "pavement", label: "Pavement and floors" },
  { id: "trail", label: "Dirt and rock trails" },
  { id: "wet", label: "Wet ground" },
  { id: "snow", label: "Snow and ice" },
  { id: "jobsite", label: "Job site" },
];

export interface Source {
  label: string;
  url: string;
}

/** One stated fact and where it came from. */
export interface Fact {
  text: string;
  source: Source;
}

export interface Shoe {
  id: string;
  name: string;
  kind: string;
  activities: Activity[];
  /** Surfaces the maker sells it for. */
  surfaces: Surface[];
  tread: {
    /** Missing when no source we checked names the outsole: the page says "Not published". */
    outsole?: Fact;
    lugs?: Fact;
    /** Whether the sole can be replaced by a cobbler. */
    resole?: Fact;
  };
  traction: {
    madeFor: Fact;
    limits?: Fact;
  };
  /** Waterproofing, safety toe, warmth: only what a source states. */
  extras: Fact[];
  /** A tagged Amazon search, so a sold-out size never strands anyone on one listing. */
  search: string;
}

export const CHECKED_ON = "November 14, 2026";

const kintec: Source = { label: "Kintec listing", url: "https://shop.kintec.net/new-balance-mens-928v3/" };
const fleetFeet: Source = { label: "Fleet Feet listing", url: "https://www.fleetfeet.com/products/mens-asics-gel-kayano-31" };
const trailhead: Source = { label: "Trailhead Paddle Shack listing", url: "https://www.trailheadpaddleshack.ca/products/merrell-moab-3-waterproof-hiking-shoe-men-s" };
const campmorKeen: Source = { label: "Campmor listing", url: "https://www.campmor.com/products/keen-mens-targhee-iii-waterproof-hiking-shoe" };
const altitude: Source = { label: "Altitude Sports listing", url: "https://www.altitude-sports.com/products/sorel-mens-caribou-waterproof-boots-40f-40c-llll-srl-1002871" };
const thorogood: Source = { label: "Thorogood (maker)", url: "https://thorogoodusa.com/american-heritage-6-tobacco-moc-toe-maxwear-wedge-814-4200/" };
const lehigh: Source = { label: "Lehigh Safety Shoes listing", url: "https://lehighsafetyshoes.com/products/TB133034" };

export const SHOES: Shoe[] = [
  {
    id: "nb-928v3",
    name: "New Balance 928v3",
    kind: "Walking shoe",
    activities: ["walk"],
    surfaces: ["pavement"],
    tread: {},
    traction: { madeFor: { text: "Sold as a walking shoe", source: kintec } },
    extras: [
      { text: "ROLLBAR stability and ABZORB midfoot cushioning", source: kintec },
      { text: "Removable insole; orthotic friendly", source: kintec },
    ],
    search: "New Balance 928v3 walking shoe",
  },
  {
    id: "asics-kayano-31",
    name: "ASICS GEL-Kayano 31",
    kind: "Road running shoe",
    activities: ["run", "walk"],
    surfaces: ["pavement"],
    tread: {
      outsole: { text: "A mix of ASICSGRIP and AHARPLUS rubber, placed by zone", source: fleetFeet },
    },
    traction: { madeFor: { text: "Listed for road running", source: fleetFeet } },
    extras: [{ text: "10 mm heel-to-toe drop", source: fleetFeet }],
    search: "ASICS GEL-Kayano 31",
  },
  {
    id: "merrell-moab-3-wp",
    name: "Merrell Moab 3 Waterproof",
    kind: "Hiking shoe",
    activities: ["hike", "walk"],
    surfaces: ["trail", "wet", "pavement"],
    tread: {
      outsole: { text: "Vibram TC5+ rubber outsole", source: trailhead },
      lugs: { text: "5 mm lugs", source: trailhead },
    },
    traction: { madeFor: { text: "Sold as a waterproof hiking shoe", source: trailhead } },
    extras: [
      { text: "Waterproof membrane; pig suede leather and mesh upper", source: trailhead },
      { text: "Rubber heel and toe cap", source: trailhead },
    ],
    search: "Merrell Moab 3 Waterproof hiking shoe",
  },
  {
    id: "keen-targhee-iii-wp",
    name: "KEEN Targhee III Waterproof",
    kind: "Hiking shoe",
    activities: ["hike", "walk"],
    surfaces: ["trail", "wet"],
    tread: {
      outsole: { text: "KEEN.ALL-TERRAIN rubber outsole", source: campmorKeen },
      lugs: { text: "4 mm multi-directional lugs", source: campmorKeen },
    },
    traction: { madeFor: { text: "Sold as a waterproof low hiking shoe", source: campmorKeen } },
    extras: [{ text: "KEEN.DRY waterproof, breathable membrane", source: campmorKeen }],
    search: "KEEN Targhee III Waterproof hiking shoe",
  },
  {
    id: "sorel-caribou",
    name: "Sorel Caribou",
    kind: "Snow boot",
    activities: ["snow"],
    surfaces: ["snow", "wet"],
    tread: {
      outsole: { text: "Vulcanized rubber shell and outsole with Aero-Trac tread", source: altitude },
    },
    traction: { madeFor: { text: "Sold as a waterproof winter boot", source: altitude } },
    extras: [
      { text: "Sorel rates it to −40°F (−40°C). That is the maker's rating, not an independent test", source: altitude },
      { text: "Removable felt liner", source: altitude },
    ],
    search: "Sorel Caribou winter boot",
  },
  {
    id: "thorogood-moc-wedge",
    name: "Thorogood American Heritage 6″ Moc Toe (MAXWear Wedge)",
    kind: "Work boot, soft toe",
    activities: ["work"],
    surfaces: ["jobsite", "pavement"],
    tread: {
      outsole: { text: "MAXWear Wedge slip-resistant outsole", source: thorogood },
      resole: { text: "Goodyear storm welt. Welted boots can usually be resoled; ask a cobbler", source: thorogood },
    },
    traction: { madeFor: { text: "Sold as a slip-resistant work boot", source: thorogood } },
    extras: [
      { text: "Non-safety toe; electrical hazard (EH) rated", source: thorogood },
      { text: "Made in the USA with US and globally sourced parts", source: thorogood },
    ],
    search: "Thorogood American Heritage 6 inch moc toe wedge",
  },
  {
    id: "timberland-pit-boss-st",
    name: "Timberland PRO Pit Boss 6″ Steel Toe",
    kind: "Work boot, steel toe",
    activities: ["work"],
    surfaces: ["jobsite"],
    tread: {
      outsole: { text: "Rubber outsole, slip-, oil- and abrasion-resistant", source: lehigh },
      resole: { text: "Double-row Goodyear welt. Welted boots can usually be resoled; ask a cobbler", source: lehigh },
    },
    traction: { madeFor: { text: "Meets ASTM F3445 for slip resistance", source: lehigh } },
    extras: [
      { text: "Steel toe (ASTM F2413) and electrical hazard rated, for style TB133034", source: lehigh },
      { text: "Not listed as waterproof", source: lehigh },
    ],
    search: "Timberland PRO Pit Boss 6 inch steel toe",
  },
];

/** How far a pair might go, by activity: the shopper's starting point, never a test result. */
export const MILE_RANGES: Record<Activity, { low: number; high: number; basis: string; source?: Source }> = {
  run: {
    low: 300,
    high: 500,
    basis: "A common rule of thumb for running shoes, not a test.",
    source: { label: "REI", url: "https://www.rei.com/learn/expert-advice/replace-shoes.html" },
  },
  walk: { low: 300, high: 500, basis: "The running-shoe rule of thumb, used as a starting point. There is no walking-shoe standard." },
  hike: { low: 500, high: 1000, basis: "An example only. There is no published standard for hiking shoes." },
  snow: { low: 500, high: 1000, basis: "An example only. There is no published standard for winter boots." },
  work: { low: 500, high: 1000, basis: "An example only. Work boots wear by floor, hours and weather as much as miles." },
};

export const MAX_COMPARE = 3;

export function shoesFor(activity: Activity): Shoe[] {
  return SHOES.filter((s) => s.activities.includes(activity));
}

/** "$0.24" — two decimals, or nothing when the numbers can't make a price. */
function money(n: number): string {
  return `$${n.toFixed(2)}`;
}

/**
 * Cost per mile across the shopper's own range: price ÷ miles, best case first.
 * Undefined when there is no usable price or range, so the page never prints a made-up figure.
 */
export function costPerMile(price: number, low: number, high: number): { best: string; worst: string } | undefined {
  if (!(price > 0) || !(low > 0) || !(high > 0)) return undefined;
  const [a, b] = low <= high ? [low, high] : [high, low];
  return { best: money(price / b), worst: money(price / a) };
}

/** "about 30 to 50 weeks" at the shopper's weekly miles, or undefined without them. */
export function weeksLasting(milesPerWeek: number, low: number, high: number): { from: number; to: number } | undefined {
  if (!(milesPerWeek > 0) || !(low > 0) || !(high > 0)) return undefined;
  const [a, b] = low <= high ? [low, high] : [high, low];
  return { from: Math.round(a / milesPerWeek), to: Math.round(b / milesPerWeek) };
}

/** The surfaces a shopper picked that this shoe is not sold for. */
export function surfaceGaps(shoe: Shoe, picked: readonly Surface[]): Surface[] {
  return picked.filter((s) => !shoe.surfaces.includes(s));
}
