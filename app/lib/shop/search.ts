// Shopping search that understands plain phrases ("five days without
// electricity", "birthday party for 20") with no AI service: kits match on
// their search words, numbers become the group size and length, and products
// match on name, search words, notes and category.

import { catalog, categories } from "../stockup/catalog";
import { hasPick, picksFor } from "./picks";
import type { CatalogItem } from "../stockup/types";
import { kits, type Kit } from "./kits";
import { lanes, type Lane } from "./lanes";
import { byPrep, isEmergencyKind, spread } from "./priority";

export type Intent = { people?: number; kids?: number; pets?: number; days?: number; nights?: number };

const WORDS: Record<string, number> = {
  a: 1, an: 1, one: 1, single: 1, two: 2, couple: 2, pair: 2, three: 3, few: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, dozen: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18,
  nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, hundred: 100,
};

/** Lowercase, apostrophes dropped ("teenager's" → "teenagers"), punctuation to spaces. */
export function normalize(q: string): string {
  return q.toLowerCase().replace(/['’]/g, "").replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim();
}

const NUM = "(\\d{1,3}|" + Object.keys(WORDS).join("|") + ")";
// "for a crowd" is not one person: no a/an/few in the bare "for N" pattern.
const NUMW = "(\\d{1,3}|" + Object.keys(WORDS).filter((w) => !["a", "an", "single", "couple", "pair", "few"].includes(w)).join("|") + ")";
const toNum = (s: string) => (/^\d+$/.test(s) ? Number(s) : WORDS[s] ?? 0);
const first = (text: string, re: RegExp) => {
  const m = text.match(re);
  return m ? toNum(m[1]) : undefined;
};

/** Group size and length from the words. Anything not said stays undefined. */
export function parseIntent(query: string): Intent {
  const t = ` ${normalize(query)} `;
  const out: Intent = {};
  const days = first(t, new RegExp(`\\b${NUM} (?:day|days)\\b`));
  const weeks = first(t, new RegExp(`\\b${NUM} (?:week|weeks)\\b`));
  const months = first(t, new RegExp(`\\b${NUM} (?:month|months)\\b`));
  const nights = first(t, new RegExp(`\\b${NUM} (?:night|nights)\\b`));
  if (days) out.days = days;
  else if (weeks) out.days = weeks * 7;
  else if (months) out.days = Math.min(365, months * 30);
  else if (/\bweekend\b/.test(t)) { out.days = 3; out.nights = 2; }
  else if (/\b(?:week|weekly)\b/.test(t)) out.days = 7;
  else if (/\bmonth\b/.test(t)) out.days = 30;
  else if (/\bovernight\b/.test(t)) { out.days = 2; out.nights = 1; }
  if (nights) { out.nights = nights; out.days ??= nights + 1; }

  const people = first(t, new RegExp(`\\b${NUM} (?:people|persons|person|guests|adults|family members|of us)\\b`))
    ?? first(t, /\bfamily of (\d{1,3}|[a-z]+)\b/)
    ?? first(t, /\b(?:for|of) (\d{1,3})\b(?! (?:day|days|week|weeks|month|months|night|nights|hour|hours|gallon|gallons)\b)/)
    ?? first(t, new RegExp(`\\bfor ${NUMW}\\b(?! (?:day|days|week|weeks|month|months|night|nights|hour|hours|gallon|gallons|dogs?|cats?|pets?|puppies|kids|children)\\b)`));
  const kids = first(t, new RegExp(`\\b${NUM} (?:kids|children|teens|teenagers|players|girls|boys)\\b`));
  const pets = first(t, new RegExp(`\\b${NUM} (?:dogs|cats|pets|puppies|dog|cat|pet|puppy)\\b`))
    ?? (/\b(?:dogs|cats|pets|puppies)\b/.test(t) ? 2 : /\b(?:dog|cat|pet|puppy)\b/.test(t) ? 1 : undefined);
  if (people && people > 0 && people <= 500) out.people = people;
  if (kids && kids <= 500) { out.kids = kids; out.people = Math.max(out.people ?? 0, kids + (out.people ? 0 : 1)); }
  if (pets && pets <= 50) out.pets = pets;
  return out;
}

const STOP = new Set(["a", "an", "the", "for", "of", "with", "and", "or", "to", "in", "on", "at", "my", "our", "your", "we", "i", "me", "need",
  "what", "how", "much", "many", "do", "is", "are", "be", "get", "buy", "list", "kit", "kits", "stuff", "things", "supplies", "without",
  "people", "person", "days", "day", "weeks", "week", "month", "months", "night", "nights", "ready", "prepare", "prep", "going", "about",
  "new", "first", "our", "some", "all", "just", "keep", "stay", "goods"]);

const DISASTER = new Set(["emergency", "disaster", "earthquake", "flood", "flooding", "evacuation", "evacuate", "evacuating", "landslide", "tsunami"]);
/** Words that ask for readiness in general, not one product. A search made only of these (and its kit's
 * own words) lists that kit in the store's shared preparedness order: water and food first. */
const BROAD = new Set([...DISASTER, "emergencies", "disasters", "preparedness", "prepared", "preparing", "survival", "essentials",
  "essential", "basics", "basic", "household", "home", "house", "family", "storm", "storms", "hurricane", "tornado", "outage",
  "blackout", "wildfire", "winter", "shelter", "place"]);

const ZIP_BAGS = ["zip top", "freezer bags", "food storage bags"];
/** Words that mean the same thing for product matching. */
const SYN: Record<string, string[]> = {
  electricity: ["power"], electric: ["power"], blackout: ["power", "outage"], outage: ["power"],
  dog: ["pet"], dogs: ["pet"], puppy: ["pet", "puppy"], puppies: ["pet", "puppy"], cat: ["pet", "litter"], cats: ["pet", "litter"],
  kitten: ["pet", "litter"], baby: ["baby"], newborn: ["baby", "diaper"], infant: ["baby"],
  elderly: ["older", "grab"], senior: ["older"], grandma: ["older"], grandpa: ["older"],
  snow: ["snow", "winter", "ice"], blizzard: ["snow", "winter"], freezing: ["cold", "winter"], cold: ["cold", "warm"],
  flashlight: ["flashlights"], light: ["flashlights", "lantern", "headlamps"], lights: ["flashlights", "lantern"],
  charger: ["charger", "charging"], phone: ["charger", "phone"], car: ["car"], tire: ["tire"], battery: ["batteries"],
  bbq: ["grill", "charcoal"], barbecue: ["grill", "charcoal"], cookout: ["grill"], grill: ["grill"],
  medicine: ["medicine", "medicines", "reliever"], med: ["medicines"], meds: ["medicines"], sick: ["cold medicine", "flu", "fever", "cough"], flu: ["flu", "fever"],
  diapers: ["diapers"], tp: ["toilet"], camping: ["camp", "tent"], tent: ["tent"], hiking: ["hiking", "trail"],
  party: ["party", "plates"], birthday: ["birthday", "candles", "cake"], tools: ["tool"], tool: ["tool"],
  beanies: ["beanie"], skin: ["lotion"], bandaid: ["bandage"], bandaids: ["bandage"], id: ["ids"], ids: ["id"], tv: ["tvs"], tvs: ["tv"],
  toolbox: ["tool kit", "tool"], toolboxes: ["tool kit", "tool"], raincoat: ["rain jacket", "poncho"], raincoats: ["rain jacket", "poncho"],
  ziplock: ZIP_BAGS, ziplocks: ZIP_BAGS, ziploc: ZIP_BAGS, ziplocs: ZIP_BAGS, allergic: ["allergy"],
};
// A Map, so a typed word like "constructor" can't reach an object's built-in properties.
const synonyms = new Map(Object.entries(SYN));

/** Words that describe a thing without naming one. When a search also names a thing, an item that only
 * matches these is noise ("dry beans" → beans, not a dry bag or a quick-dry towel). */
const DESCRIBING = new Set(["dry", "dried", "wet", "portable",
  "black", "white", "red", "blue", "green", "yellow", "orange", "pink", "purple", "brown", "gray", "grey", "clear", "silver",
  "big", "bigger", "small", "smaller", "large", "larger", "medium", "mini", "little", "tiny", "huge", "giant", "long", "short", "tall", "wide", "heavy",
  "best", "better", "good", "great", "top", "nice", "cheap", "cheapest", "affordable", "quick", "fast", "easy", "simple", "strong", "sturdy", "extra", "spare"]);

const stem = (w: string) => (w.length > 4 && w.endsWith("ies") ? `${w.slice(0, -3)}y` : w.length > 4 && w.endsWith("xes") ? w.slice(0, -2) : w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w);

/** The words a product search looks for, with stems and synonyms. */
export function queryWords(query: string): string[][] {
  const words = respell(query).split(" ");
  const foods = avoidedFoods(words);
  return words.flatMap((w, i) => {
    // "nut free" and "milk allergy" look for food that says it's nut-free or allergy-safe, not for nuts or milk.
    // In "nut free", both words ask for that, so both count.
    const food = foods.get(i) ?? (w === "free" ? foods.get(i - 1) : undefined);
    if (food) return [[`${food} free`, `${food} free`, "allergy safe"]];
    if (!w || STOP.has(w) || /^\d+$/.test(w) || w in WORDS) return [];
    return [[w, stem(w), ...(synonyms.get(w) ?? []).filter((x) => x !== w && x !== stem(w))]];
  });
}

const catTitle = new Map(categories.map((c) => [c.id, c.title.toLowerCase()]));
const hay = new Map<string, { name: string; heads: string[]; brand: string; rest: string }>();
function haystack(item: CatalogItem) {
  let h = hay.get(item.id);
  if (!h) {
    // Our exact products' names, so "midland" or "coleman" finds them. Matched as whole words and worth
    // less than the item's own name, so "PowerLock" or "wall power" doesn't make a tape measure a power item.
    const brand = normalize(picksFor(item.id).map((p) => p.name).join(" "));
    const name = normalize(item.name);
    // What the item is: the last word of each "and"/"or" part before any "for" or "with"
    // ("Pet food and water bowls" → food, bowls; "First aid kit for the car" → kit).
    const heads = name.split(/ (?:for|with) /)[0].split(/ (?:and|or) /).map((p) => stem(p.slice(p.lastIndexOf(" ") + 1)));
    h = { name, heads, brand, rest: normalize(`${item.q ?? ""} ${item.note ?? ""} ${catTitle.get(item.cat) ?? ""}`) };
    hay.set(item.id, h);
  }
  return h;
}
/** Whole words that are also the start of a different word: "bean" isn't "beanie", "pill" isn't "pillow".
 * Keyed by the shorter word's stem, listing how the longer words start. Typing on ("pillo") still finds them. */
const LOOKALIKES = new Map<string, string[]>(Object.entries({
  ball: ["balloon", "ballpoint"], bean: ["beanie"], bed: ["bedside"], birth: ["birthday"], black: ["blackout"], blue: ["bluetooth"], boot: ["booth"], brace: ["bracelet"],
  break: ["breakfast"], brown: ["brownie"], cabin: ["cabinet"], card: ["cardigan"], care: ["careful"], cart: ["cartridge"], chain: ["chainsaw"],
  clip: ["clipper"], cloth: ["clothe", "clothing"], compress: ["compression"], control: ["controller"], cook: ["cookie", "cookout"], cool: ["coolant"],
  cord: ["cordless"], corn: ["corned", "corner", "cornhole"], cream: ["creamer"], doll: ["dolly"], dress: ["dresser", "dressing"], fire: ["fireworks"],
  flame: ["flameless"], foot: ["footprint"], free: ["freeze"], fresh: ["freshener"], grad: ["grade"], grid: ["griddle"], hand: ["handle", "handy"],
  high: ["highlighter"], home: ["homework"], jack: ["jacket"], lice: ["license"], light: ["lighter", "lightweight"], line: ["liner"], men: ["menstrual"], mess: ["messenger"],
  must: ["mustard"], pain: ["paint"], pant: ["pantry"], paper: ["paperback"], part: ["party"], pass: ["passport"], pill: ["pillow"],
  port: ["portable", "portion"], post: ["postpartum"], press: ["pressure"], prop: ["propane"], route: ["router"], safe: ["safety"], salt: ["saltine"],
  sand: ["sandal", "sandwich"], sensor: ["sensory"], sharp: ["sharpie"], sick: ["sickness"], sign: ["signal", "signing"], slide: ["slider"], soft: ["softener"],
  spark: ["sparkling"], stand: ["standard"], star: ["start"], suit: ["suitcase"], table: ["tablet"], tire: ["tired"], toilet: ["toiletr"],
  treat: ["treatment"], wall: ["wallet"], water: ["waterproof"], wind: ["window", "windshield"], wire: ["wireless"],
}));
/** A three-letter word and its plural: "hat" → "hats", "box" → "boxes". Two-letter words stay as typed ("up" isn't "ups"). */
const wholeForms = (w: string) => (w.length === 3 ? [w, /[sx]$/.test(w) ? `${w}es` : `${w}s`] : [w]);
// Words of four letters or more also match the start of a longer word ("tent" → "tents"); short ones
// must match whole or as a plural, so "hat" finds "hats" but "car" doesn't find "carbon".
const hasWord = (text: string, w: string) => {
  const others = w.length >= 4 ? LOOKALIKES.get(stem(w)) : undefined;
  if (others) return text.split(" ").some((t) => t.startsWith(w) && !others.some((o) => t.startsWith(o)));
  if (w.length >= 4) return ` ${text} `.includes(` ${w}`);
  return wholeForms(w).some((f) => ` ${text} `.includes(` ${f} `));
};

/** Items a word finds by accident, unless another word in the search asks for them. */
const AVOID: Record<string, { ids: string[]; unless: string }> = {
  dog: { ids: ["hot-dogs", "hot-dog-buns"], unless: "hot" },
  dogs: { ids: ["hot-dogs", "hot-dog-buns"], unless: "hot" },
  aid: { ids: ["calming-aids-for-pets"], unless: "calming" },
  grab: { ids: ["granola-or-protein-bars", "emergency-food-bars-for-the-car", "3-day-emergency-food-supply"], unless: "food" },
};

/** Foods a search can stay away from, and the words in an item's name that mean that food. */
const GLUTEN = ["bread", "bun", "pasta", "noodle", "macaroni", "flour", "cracker", "pretzel", "cookie", "cereal", "pancake", "tortilla", "granola"];
const FOODS = new Map<string, string[]>(Object.entries({
  nut: ["nut", "peanut", "trail mix"], peanut: ["peanut", "trail mix"], egg: ["egg"], milk: ["milk"], dairy: ["milk", "cheese"], lactose: ["milk", "cheese"],
  gluten: GLUTEN, wheat: GLUTEN, soy: ["soy"], fish: ["fish", "tuna", "salmon", "sardine"], shellfish: ["shellfish", "shrimp", "crab", "lobster"], sesame: ["sesame"],
}));
/** Words that make the foods beside them something to stay away from. */
const ALLERGY = new Set(["free", "allergy", "allergies", "allergic", "intolerance", "intolerant"]);

/** The foods a search stays away from, by their place in it: just before "free" or "allergy" ("milk and egg
 * allergy", "peanut free") or just after "allergic to". */
function avoidedFoods(words: string[]): Map<number, string> {
  const out = new Map<number, string>();
  const take = (from: number, step: number) => {
    for (let j = from; j >= 0 && j < words.length; j += step) {
      const food = stem(words[j]);
      if (FOODS.has(food)) out.set(j, food);
      else if (words[j] !== "and" && words[j] !== "or") return;
    }
  };
  words.forEach((w, i) => {
    if (!ALLERGY.has(w)) return;
    take(i - 1, -1);
    if (w !== "free" && words[i + 1] === "to") take(i + 2, 1);
  });
  return out;
}

/** True when a search names a food to stay away from ("nut free", "milk allergy"). */
export function avoidsFood(query: string): boolean {
  return avoidedFoods(respell(query).split(" ")).size > 0;
}

/** The store's own words: every start of a word that finds something, every two words that sit side by side,
 * and the long words in item names, search words and kit terms. Built on the first search. */
let spelling: { known: Set<string>; pairs: Set<string>; joined: Set<string> } | undefined;
function storeWords() {
  if (spelling) return spelling;
  const items = catalog.filter((i) => i.kind !== "task");
  const known = new Set<string>(), pairs = new Set<string>(), joined = new Set<string>();
  const starts = (into: Set<string>, text: string, min: number) => {
    for (const t of text.split(" ")) for (let n = min; n <= t.length; n++) into.add(t.slice(0, n));
  };
  for (const item of items) { const h = haystack(item); starts(known, `${h.name} ${h.brand} ${h.rest}`, 4); }
  const things = [...items.flatMap((i) => [i.name, i.q ?? ""]), ...kits.flatMap((k) => k.terms)].map(normalize);
  for (const text of [...things, ...items.map((i) => normalize(i.note ?? "")), ...categories.map((c) => normalize(c.title))]) {
    const w = text.split(" ");
    for (let n = 1; n < w.length; n++) { pairs.add(`${w[n - 1]} ${w[n]}`); pairs.add(`${w[n - 1]} ${stem(w[n])}`); }
  }
  for (const text of things) starts(joined, text, 6);
  return (spelling = { known, pairs, joined });
}

/** The search in the store's spelling: "firstaid" → "first aid", "sand bag" → "sandbag", "bug out bag" → "go bag". */
export function respell(query: string): string {
  const { known, pairs, joined } = storeWords();
  // Side by side somewhere in the store, or with a synonym of the first word ("catfood" as "pet food").
  const pair = (a: string, b: string) => [a, ...(synonyms.get(a) ?? [])].some((x) => pairs.has(`${x} ${b}`) || pairs.has(`${x} ${stem(b)}`));
  // A bug-out bag is a go-bag, and tree nuts are nuts.
  const words = normalize(query).replace(/\bbug ?out(?=\b|bags?\b)/g, "go ").replace(/\btree (nuts?)\b/g, "$1").split(" ").filter(Boolean).flatMap((w) => {
    if (w.endsWith("free") && FOODS.has(stem(w.slice(0, -4)))) return [w.slice(0, -4), "free"];
    if (w.length < 5 || /\d/.test(w) || synonyms.has(w) || w in WORDS || known.has(w)) return [w];
    // A word nothing in the store starts with, made of two or three words the store puts side by side.
    for (let i = 2; i <= w.length - 2; i++) if (pair(w.slice(0, i), w.slice(i))) return [w.slice(0, i), w.slice(i)];
    for (let i = 2; i <= w.length - 4; i++) {
      for (let j = i + 2; j <= w.length - 2; j++) {
        const [a, b, c] = [w.slice(0, i), w.slice(i, j), w.slice(j)];
        if (pair(a, b) && pair(b, c)) return [a, b, c];
      }
    }
    return [w];
  });
  // Two words the store only writes as one.
  for (let i = 0; i < words.length - 1; i++) {
    const [a, b] = [words[i], words[i + 1]];
    if (a.length >= 3 && b.length >= 3 && !STOP.has(a) && !STOP.has(b) && joined.has(a + b) && !pair(a, b)) words.splice(i, 2, a + b);
  }
  return words.join(" ");
}

/** Products ranked by how well they match. Each query word must match somewhere unless none would. */
export function searchItems(query: string, limit = 40): CatalogItem[] {
  const groups = queryWords(query);
  if (!groups.length) return [];
  const words = respell(query).split(" ");
  const avoid = new Set(words.flatMap((w) => (AVOID[w] && !words.includes(AVOID[w].unless) ? AVOID[w].ids : [])));
  // An allergy search leaves out food named for what it stays away from.
  const foods = [...avoidedFoods(words).values()].flatMap((f) => FOODS.get(f) ?? []);
  // A synonym that is also a typed word would count that word twice ("power outage" → "power power").
  const typed = new Set(groups.flatMap((g) => g.slice(0, 2)));
  // A search that names a kit's situation ("power outage", "new puppy") ranks that kit's must-haves first,
  // then its upgrades and easy-to-forget items, even when their names share no word with the search.
  const top = scoreKits(query)[0];
  // A disaster with no kit of its own ("earthquake", "flood") gets the basic emergency kit's ranking.
  const general = groups.every((g) => BROAD.has(g[0]));
  const kit = top?.phrase ? top.k : words.some((w) => DISASTER.has(w)) || general ? kits.find((k) => k.slug === "five-day-emergency") : undefined;
  const kitWords = new Set(kit ? normalize([...kit.terms, kit.title].join(" ")).split(" ") : []);
  const broad = !!kit && isEmergencyKind(kit.base) && groups.every((g) => BROAD.has(g[0]) || kitWords.has(g[0]));
  const boost = new Map<string, number>([
    ...(kit?.forget ?? []).map((id) => [id, 1] as const),
    ...(kit?.upgrades ?? []).map((id) => [id, 1.5] as const),
    ...(kit?.essentials ?? []).map((id) => [id, 3] as const),
  ]);
  const scored: { item: CatalogItem; score: number; all: boolean; kitBoost: number; named: boolean }[] = [];
  for (const item of catalog) {
    if (item.kind === "task" || avoid.has(item.id)) continue;
    const h = haystack(item);
    if (foods.some((f) => hasWord(h.name, f))) continue;
    let score = 0;
    let matched = 0;
    let named = false;
    for (const g of groups) {
      // g[0] and g[1] are the typed word and its stem; the rest are synonyms, worth a little less.
      const own = g.slice(0, 2);
      const syn = g.slice(2).filter((w) => !typed.has(w));
      const s = own.some((w) => hasWord(h.name, w)) ? 3 : syn.some((w) => hasWord(h.name, w)) ? 2
        : own.some((w) => wholeForms(w).some((f) => ` ${h.brand} `.includes(` ${f} `))) ? 2
        : own.some((w) => hasWord(h.rest, w)) ? 1 : syn.some((w) => hasWord(h.rest, w)) ? 0.5 : 0;
      if (s) { score += s; matched++; named ||= !DESCRIBING.has(g[0]); }
    }
    const kitBoost = boost.get(item.id) ?? 0;
    if (!matched && !kitBoost) continue;
    const all = matched === groups.length || kitBoost > 0;
    score += (all ? 4 : 0) + kitBoost;
    // A typed word that is the thing itself ("water" → "Bottled water") beats one that only describes it
    // ("Pet food and water bowls"), even when the second has an exact product.
    if (groups.some((g) => g.slice(0, 2).some((w) => h.heads.includes(stem(w))))) score += 1;
    score += item.pri === "essential" ? 1.5 : item.pri === "useful" ? 0.5 : 0;
    if (hasPick(item.id)) score += 0.75;
    scored.push({ item, score, all, kitBoost, named });
  }
  // A broad readiness search: the kit's must-haves, then its other items, each in preparedness order.
  // When enough items match every word, the partial matches are noise ("grab bar" → not "granola bars").
  // So are items that only match a describing word, once something matches the thing it describes.
  const full = scored.filter((s) => s.all);
  const things = scored.filter((s) => s.named || s.kitBoost);
  const pool = groups.length < 2 ? scored : full.length >= 3 ? full : things.length ? things : scored;
  // Each necessity once first (spread), so a short list covers water, food, light, power, first aid and a radio.
  if (broad) {
    const must = spread(scored.filter((s) => s.kitBoost >= 3).map((s) => s.item));
    const more = byPrep(scored.filter((s) => s.kitBoost > 0 && s.kitBoost < 3).map((s) => s.item));
    const other = pool.filter((s) => !s.kitBoost).sort((a, b) => b.score - a.score).map((s) => s.item);
    return [...must, ...more, ...other].slice(0, limit);
  }
  return pool.sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name)).slice(0, limit).map((s) => s.item);
}

/** Kit terms and titles in the store's spelling, worked out once each. */
const kitSpelling = new Map<string, string>();
const spelled = (text: string) => kitSpelling.get(text) ?? kitSpelling.set(text, respell(text)).get(text)!;

/** Kits scored by their search words; longer phrases count for more. `phrase`: a multi-word term or the title matched. */
function scoreKits(query: string): { k: Kit; score: number; phrase: boolean }[] {
  const t = ` ${respell(query)} `;
  if (!t.trim()) return [];
  return kits.map((k) => {
    let score = 0;
    let phrase = false;
    for (const term of k.terms) {
      const n = spelled(term);
      // A one-word search that is the kit's own name ("hurricane", "tornado") counts as naming it.
      if (n && t.includes(` ${n} `)) { score += n.split(" ").length * 2; phrase ||= n.includes(" ") || (t.trim() === n && k.slug === n); }
      else if (n.length > 4 && t.includes(` ${n}`)) score += 1;
      // A one-word search that is the term's singular counts too ("pet" → "pets").
      else if (t.trim() === stem(n)) score += 2;
    }
    if (t.includes(` ${spelled(k.title)} `)) { score += 3; phrase = true; }
    return { k, score, phrase };
  }).filter((s) => s.score > 0).sort((a, b) => b.score - a.score);
}

/** Kits ranked by their search words. */
export function searchKits(query: string): Kit[] {
  return scoreKits(query).map((s) => s.k);
}

/** Lanes whose title shares a word with the query. */
export function searchLanes(query: string): Lane[] {
  const groups = queryWords(query);
  return lanes.filter((l) => {
    const title = normalize(`${l.title} ${l.blurb}`);
    return groups.some((g) => g.some((w) => w.length > 2 && hasWord(title, w)));
  });
}

/** The kit link with the group and length the visitor typed. */
export function kitHref(kit: Kit, intent: Intent): string {
  const p = new URLSearchParams();
  if (intent.people && kit.ask.includes("people")) p.set("people", String(intent.people));
  if (intent.kids && kit.ask.includes("kids")) p.set("kids", String(intent.kids));
  if (intent.pets && kit.ask.includes("pets")) p.set("pets", String(intent.pets));
  if (intent.days && kit.ask.includes("days")) p.set("days", String(intent.days));
  const qs = p.toString();
  return `/kits/${kit.slug}${qs ? `?${qs}` : ""}`;
}

/** Example searches shown under the search box. */
export const EXAMPLES = [
  "Five days without electricity", "Water for four people", "New puppy", "Teenager's first car", "Winter storm",
  "Kids' field hockey tournament", "Weekend camping", "Birthday party for 20", "Elderly parent living alone",
  "Road trip with dogs", "First apartment", "Holiday guests",
];
