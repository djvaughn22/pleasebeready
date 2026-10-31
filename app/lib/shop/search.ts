// Shopping search that understands plain phrases ("five days without
// electricity", "birthday party for 20") with no AI service: kits match on
// their search words, numbers become the group size and length, and products
// match on name, search words, notes and category.

import { catalog, categories } from "../stockup/catalog";
import { hasPick, picksFor } from "./picks";
import type { CatalogItem } from "../stockup/types";
import { kits, type Kit } from "./kits";
import { lanes, type Lane } from "./lanes";

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
  "new", "first", "our", "some", "all", "just"]);

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
  medicine: ["medicine", "medicines", "reliever"], meds: ["medicines"], sick: ["cold", "flu", "fever"], flu: ["flu", "fever"],
  diapers: ["diapers"], tp: ["toilet"], camping: ["camp", "tent"], tent: ["tent"], hiking: ["hiking", "trail"],
  party: ["party", "plates"], birthday: ["birthday", "candles", "cake"], tools: ["tool"], tool: ["tool"],
};

const stem = (w: string) => (w.length > 4 && w.endsWith("ies") ? `${w.slice(0, -3)}y` : w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w);

/** The words a product search looks for, with stems and synonyms. */
export function queryWords(query: string): string[][] {
  return normalize(query).split(" ")
    .filter((w) => w && !STOP.has(w) && !/^\d+$/.test(w) && !(w in WORDS))
    .map((w) => [w, stem(w), ...(SYN[w] ?? []).filter((x) => x !== w && x !== stem(w))]);
}

const catTitle = new Map(categories.map((c) => [c.id, c.title.toLowerCase()]));
const hay = new Map<string, { name: string; rest: string }>();
function haystack(item: CatalogItem) {
  let h = hay.get(item.id);
  if (!h) {
    // Our exact products' names count as the item's name, so "midland" or "coleman" finds them.
    const brands = picksFor(item.id).map((p) => p.name).join(" ");
    h = { name: normalize(`${item.name} ${brands}`), rest: normalize(`${item.q ?? ""} ${item.note ?? ""} ${catTitle.get(item.cat) ?? ""}`) };
    hay.set(item.id, h);
  }
  return h;
}
// Words of four letters or more also match the start of a longer word ("tent" → "tents"); short ones
// must match whole, so "car" doesn't find "carbon" and "bar" doesn't find "barrel".
const hasWord = (text: string, w: string) => ` ${text} `.includes(w.length >= 4 ? ` ${w}` : ` ${w} `);

/** Items a word finds by accident, unless another word in the search asks for them. */
const AVOID: Record<string, { ids: string[]; unless: string }> = {
  dog: { ids: ["hot-dogs", "hot-dog-buns"], unless: "hot" },
  dogs: { ids: ["hot-dogs", "hot-dog-buns"], unless: "hot" },
};

/** Products ranked by how well they match. Each query word must match somewhere unless none would. */
export function searchItems(query: string, limit = 40): CatalogItem[] {
  const groups = queryWords(query);
  if (!groups.length) return [];
  const words = normalize(query).split(" ");
  const avoid = new Set(words.flatMap((w) => (AVOID[w] && !words.includes(AVOID[w].unless) ? AVOID[w].ids : [])));
  const scored: { item: CatalogItem; score: number; all: boolean }[] = [];
  for (const item of catalog) {
    if (item.kind === "task" || avoid.has(item.id)) continue;
    const h = haystack(item);
    let score = 0;
    let matched = 0;
    for (const g of groups) {
      // g[0] and g[1] are the typed word and its stem; the rest are synonyms, worth a little less.
      const own = g.slice(0, 2);
      const syn = g.slice(2);
      const s = own.some((w) => hasWord(h.name, w)) ? 3 : syn.some((w) => hasWord(h.name, w)) ? 2
        : own.some((w) => hasWord(h.rest, w)) ? 1 : syn.some((w) => hasWord(h.rest, w)) ? 0.5 : 0;
      if (s) { score += s; matched++; }
    }
    if (!matched) continue;
    const all = matched === groups.length;
    score += all ? 4 : 0;
    score += item.pri === "essential" ? 1.5 : item.pri === "useful" ? 0.5 : 0;
    if (hasPick(item.id)) score += 0.75;
    scored.push({ item, score, all });
  }
  // When enough items match every word, the partial matches are noise ("grab bar" → not "granola bars").
  const full = scored.filter((s) => s.all);
  const pool = groups.length > 1 && full.length >= 3 ? full : scored;
  return pool.sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name)).slice(0, limit).map((s) => s.item);
}

/** Kits ranked by their search words; longer phrases count for more. */
export function searchKits(query: string): Kit[] {
  const t = ` ${normalize(query)} `;
  if (!t.trim()) return [];
  const scored = kits.map((k) => {
    let score = 0;
    for (const term of k.terms) {
      const n = normalize(term);
      if (n && t.includes(` ${n} `)) score += n.split(" ").length * 2;
      else if (n.length > 4 && t.includes(` ${n}`)) score += 1;
    }
    if (t.includes(` ${normalize(k.title)} `)) score += 3;
    return { k, score };
  }).filter((s) => s.score > 0);
  return scored.sort((a, b) => b.score - a.score).map((s) => s.k);
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
