// Line format for the bulk of the catalog, so a thousand entries stay easy to
// read, review and update as demand changes. One entry per line:
//
//   Name ; situations ; rule ; unit ; priority ; extras
//
// situations: codes from OCC below, comma-separated; macros WX, EV, TRIP; * = every situation.
// rule:       g:2 (group) p a k b pet (each) pd kd bd petd (per day) pn (per night)
//             pm (per meal) with a rate after the colon; v = quantity varies (say why in n=);
//             t = a task to do, not a product.
// unit:       "can" or "box/boxes".
// priority:   e essential, u useful, x extra.
// extras:     separated by " | " or " ; ": n=note  q=Amazon search words  pack=24  need=kids|babies|pets|older|mobility|medical
//             clim=cold|hot|wet  s=seasonal|event  src=<source id>  pro  id=<id>
//             (exact Amazon products are not set here: see app/lib/shop/picks.ts)
// A "## category" line sets the category for the lines below it. Tasks always
// land in the "tasks" category.

import type { CatalogItem, CategoryId, Climate, Need, OccasionId, Per, Priority, Season, SourceId } from "../types";

export const OCC: Record<string, OccasionId> = {
  hom: "home", eme: "emergency", cmp: "camping", slp: "sleepover", pty: "party", rdt: "roadtrip",
  vac: "vacation", bch: "beach", tlg: "tailgate", hst: "hosting", pic: "picnic", out: "outage",
  win: "winter", hur: "hurricane", hea: "heat", wil: "wildfire", fld: "flood", veh: "vehicle",
  sch: "school", col: "college", wrk: "work", mov: "moving", sik: "sick", nbb: "newbaby",
  crg: "caregiving", pet: "petprep", hik: "hiking", spt: "sports",
};
const MACRO: Record<string, string[]> = {
  WX: ["eme", "out", "win", "hur", "hea", "wil", "fld"],
  EV: ["pty", "hst", "pic", "tlg", "slp"],
  TRIP: ["rdt", "vac", "cmp"],
  "*": Object.keys(OCC),
};
const PER: Record<string, Per> = {
  g: "group", p: "person", a: "adult", k: "kid", b: "baby", pet: "pet", pd: "personDay",
  kd: "kidDay", bd: "babyDay", petd: "petDay", pn: "personNight", pm: "personMeal", v: "varies", t: "task",
};
const PRI: Record<string, Priority> = { e: "essential", u: "useful", x: "extra" };
const NEEDS = ["kids", "babies", "pets", "older", "mobility", "medical"];
const CLIMATES = ["cold", "hot", "wet"];

export const slug = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Parses one data block. Throws on any malformed line, so a bad edit fails the build and tests. */
export function parseBlock(text: string): CatalogItem[] {
  const out: CatalogItem[] = [];
  let cat: CategoryId | null = null;
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("//")) continue;
    if (line.startsWith("## ")) { cat = line.slice(3).trim() as CategoryId; continue; }
    const parts = line.split(" ; ").map((p) => p.trim());
    if (parts.length < 5 || !cat) throw new Error(`Bad catalog line: ${line}`);
    const [name, occs, ruleText, unitText, pri, ...rest] = parts;
    const extras = rest.join(" | ");
    const occ = [...new Set(occs.split(",").flatMap((c) => MACRO[c.trim()] ?? [c.trim()]))].map((c) => {
      if (!OCC[c]) throw new Error(`Unknown situation "${c}" in: ${line}`);
      return OCC[c];
    });
    const [perKey, rate] = ruleText.split(":");
    const per = PER[perKey];
    if (!per) throw new Error(`Unknown rule "${ruleText}" in: ${line}`);
    const n = per === "varies" || per === "task" ? 1 : Number(rate);
    if (!(n > 0)) throw new Error(`Bad rate in: ${line}`);
    const [one, many] = unitText.split("/");
    if (!PRI[pri]) throw new Error(`Bad priority in: ${line}`);
    const item: CatalogItem = {
      id: slug(name), name, cat: per === "task" ? "tasks" : cat, occ,
      rule: { per, n }, unit: { one, many: many ?? `${one}s` }, pri: PRI[pri],
      kind: per === "task" ? "task" : "product", season: "year-round",
    };
    for (const ex of extras.split(" | ").map((e) => e.trim()).filter(Boolean)) {
      const eq = ex.indexOf("=");
      const key = eq < 0 ? ex : ex.slice(0, eq);
      const val = eq < 0 ? "" : ex.slice(eq + 1).trim();
      if (key === "n") item.note = val;
      else if (key === "q") item.q = val;
      else if (key === "pack") item.pack = Number(val);
      else if (key === "need" && NEEDS.includes(val)) item.needs = val as Need;
      else if (key === "clim" && CLIMATES.includes(val)) item.climate = val as Climate;
      else if (key === "s" && (val === "seasonal" || val === "event")) item.season = val as Season;
      else if (key === "src") item.source = val as SourceId;
      else if (key === "asin") throw new Error(`Exact products live in app/lib/shop/picks.ts, not catalog lines: ${line}`);
      else if (key === "pro") item.pro = true;
      else if (key === "id") item.id = val;
      else throw new Error(`Bad extra "${ex}" in: ${line}`);
    }
    out.push(item);
  }
  return out;
}
