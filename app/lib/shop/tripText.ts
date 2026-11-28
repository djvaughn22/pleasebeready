// The trip as a plain list to download, copy or print: what to check at home, what to buy this
// trip with package counts and where, what can wait, and how to store it.
//
// No Amazon links in the file: Associates links belong on the site itself, not in documents
// people keep or forward (Associates Program Policies, "offline" promotion). Product names stay,
// so the list works at any store.

import { amazonList } from "./amazonCart";
import { FOCUS_LABEL, budgetLine, coverageLine, laterTrips, packWords, thisTrip, type Row, type TripPlan } from "./trip";

const n = (x: number) => x.toLocaleString("en-US");
const money = (x: number) => `$${x.toFixed(2)}`;
const GALLONS_PER_BOTTLE = 16.9 / 128;

/** What the packages hold: "(12 gallons, single jugs)", "(96 bottles, about 12 gallons)", "(12 cans)". */
export function amountHint(r: Row, packs: number): string {
  const amazon = !r.local && !!r.offer;
  const units = amazon ? packs * r.offer!.per : packs * r.unitsPer;
  if (r.item.id === "water") return `(${n(units)} ${units === 1 ? "gallon" : "gallons"}${amazon ? `, ${units === 1 ? "a single jug" : "single jugs"}` : ""})`;
  if (r.item.id === "bottled-water") return `(${n(units)} bottles, about ${n(Math.floor(units * GALLONS_PER_BOTTLE))} gallons)`;
  if ((amazon ? r.offer!.per : r.unitsPer) > 1) return `(${n(units)} ${units === 1 ? r.item.unit.one : r.item.unit.many})`;
  return "";
}

function line(r: Row, packs: number, withPrice: boolean): string {
  const where = r.local || !r.offer ? "nearby" : `Amazon: ${r.offer.pick.name}`;
  const price = withPrice && r.price != null ? ` · your price ${money(r.price)} each = ${money(r.price * packs)}` : "";
  const hint = amountHint(r, packs);
  return `[ ] ${r.label}: ${packWords(r, packs)}${hint ? ` ${hint}` : ""} · ${where}${price}`;
}

export function tripText(plan: TripPlan): string {
  const a = plan.ask;
  const out: string[] = [
    "PleaseBeReady shopping list",
    `${plan.situation.label} · ${a.people} ${a.people === 1 ? "person" : "people"} · ${a.days} ${a.days === 1 ? "day" : "days"} · $${n(a.budget)} budget · ${FOCUS_LABEL[a.first]} first`,
    "",
  ];
  const have: string[] = [];
  if (plan.water) have.push(`Water: ${coverageLine("water", plan.water, a.days)} (${n(Math.floor(plan.water.after + 1e-9))} of ${n(plan.water.need)} ${plan.water.need === 1 ? "gallon" : "gallons"})`);
  if (plan.food) have.push(`Food, an estimate: ${coverageLine("food", plan.food, a.days)}`);
  if (plan.light) have.push(`Light: ${n(plan.light.after)} ${plan.light.after === 1 ? "light" : "lights"} for ${n(plan.light.people)} ${plan.light.people === 1 ? "person" : "people"}`);
  if (have.length) out.push("AFTER THIS TRIP", ...have, "");

  out.push("1. CHECK WHAT YOU HAVE (free)", ...plan.checks.map((s) => `[ ] ${s.text}`), "");

  const now = thisTrip(plan);
  const list = amazonList(plan);
  out.push("2. BUY THIS TRIP");
  if (now.length) {
    out.push(...now.map((r) => line(r, r.now, true)));
    out.push(`${budgetLine(plan)}`);
    if (list.lines.length) out.push(`On Amazon: ${list.lines.length} ${list.lines.length === 1 ? "product" : "products"}, ${n(list.packs)} ${list.packs === 1 ? "package" : "packages"}. Nearby: ${n(list.local.length)}.`);
  } else {
    out.push(a.budget > 0 ? "Nothing this trip." : "Nothing to buy on a $0 trip. Start with the free steps above.");
  }
  out.push("");

  const later = laterTrips(plan);
  if (later.length) {
    out.push("NEXT TRIP (can wait)", ...later.map((r) => line(r, r.later, false)), "");
  }

  out.push("3. STORE AND ROTATE", ...plan.store.map((s) => `- ${s.text}`), "");
  out.push(
    "Water: 1 gallon per person per day (CDC). Food is an estimate from label calories, 2,000 a day.",
    "Prices are only the ones you typed. We can't see store or Amazon prices or stock.",
    "Made on pleasebeready.com",
  );
  return out.join("\n");
}
