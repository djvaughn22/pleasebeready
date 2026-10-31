// Upkeep for our exact products in app/lib/shop/picks.ts (workflow in docs/CATALOG.md).
//
//   npm run picks -- due [days]             entries whose evidence is older than `days` (default 90): re-check these
//   npm run picks -- add <rows.tsv> [--dry] append reviewed rows, then run `npm test`, which checks every rule
//
// rows.tsv: a header row, then one tab-separated row per product; lines starting with # are skipped.
// Columns: item role asin name why use via seen [checked]. `checked` defaults to today.

import { readFileSync, writeFileSync } from "node:fs";

const FILE = new URL("../app/lib/shop/picks.ts", import.meta.url);
const src = readFileSync(FILE, "utf8");
const CHECKED = src.match(/export const CHECKED = "([\d-]+)"/)[1];
const entries = [...src.matchAll(/^ {2}\{ item: "([^"]+)", role: "(\w+)", asin: "(\w+)", name: ("(?:[^"\\]|\\.)*")(.*)$/gm)].map((m) => ({
  item: m[1], role: m[2], asin: m[3], name: JSON.parse(m[4]), checked: m[5].match(/checked: "([\d-]+)"/)?.[1] ?? CHECKED,
}));
const today = new Date().toLocaleDateString("en-CA");
const [cmd, arg, flag] = process.argv.slice(2);

if (cmd === "due") {
  const days = Number(arg ?? 90);
  const cutoff = new Date(Date.now() - days * 864e5).toLocaleDateString("en-CA");
  const due = entries.filter((e) => e.checked <= cutoff);
  for (const e of due) console.log(`${e.checked}  ${e.asin}  ${e.item} (${e.role})  ${e.name}  https://www.amazon.com/dp/${e.asin}`);
  console.log(`${due.length} of ${entries.length} entries were checked on or before ${cutoff}.`);
} else if (cmd === "add" && arg) {
  const rows = readFileSync(arg, "utf8").split("\n").filter((l) => l.trim() && !l.startsWith("#"));
  const head = rows.shift().split("\t").map((h) => h.trim());
  const problems = [];
  const lines = rows.map((row, i) => {
    const r = Object.fromEntries(head.map((h, j) => [h, (row.split("\t")[j] ?? "").trim()]));
    const where = `row ${i + 1} (${r.item || "?"})`;
    for (const k of ["item", "role", "asin", "name", "why", "use", "via", "seen"]) if (!r[k]) problems.push(`${where}: no ${k}`);
    if (!/^[A-Z0-9]{10}$/.test(r.asin)) problems.push(`${where}: ASIN should be 10 letters and digits`);
    if (!["pick", "value", "upgrade", "alt"].includes(r.role)) problems.push(`${where}: role must be pick, value, upgrade or alt`);
    if (!["page", "search"].includes(r.via)) problems.push(`${where}: via must be page or search`);
    if (r.checked && !/^\d{4}-\d{2}-\d{2}$/.test(r.checked)) problems.push(`${where}: checked must be YYYY-MM-DD`);
    if (entries.some((e) => e.item === r.item && (e.role === r.role || e.asin === r.asin))) problems.push(`${where}: already has that role or ASIN`);
    const checked = r.checked || today;
    const fields = ["item", "role", "asin", "name", "why", "use", "via", "seen"].map((k) => `${k}: ${JSON.stringify(r[k])}`);
    return `  { ${fields.join(", ")}${checked === CHECKED ? "" : `, checked: ${JSON.stringify(checked)}`} },`;
  });
  if (problems.length) {
    console.error(problems.join("\n"));
    process.exit(1);
  }
  if (flag === "--dry") {
    console.log(lines.join("\n"));
  } else {
    const end = src.indexOf("\n];", src.indexOf("export const picks"));
    writeFileSync(FILE, `${src.slice(0, end)}\n${lines.join("\n")}${src.slice(end)}`);
    console.log(`Added ${lines.length} to app/lib/shop/picks.ts. Now run npm test: it checks catalog ids, wording and duplicates.`);
  }
} else {
  console.log("Usage: npm run picks -- due [days] | npm run picks -- add <rows.tsv> [--dry]");
}
