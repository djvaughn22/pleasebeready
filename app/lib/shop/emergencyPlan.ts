// The top of home (owner direction 2026-11-20, night): PleaseBeReady leads with
// household emergency preparedness. Pick what you are getting ready for, how many
// people and how long; "Build your emergency plan" opens that kit's checklist with
// amounts (kit pages read ?people= and ?days=, see numbersFromQuery in kitPlan.ts).
// A fresh visit with nothing saved plans a power outage for 4 people, 3 days.
// A returning visitor's own choice (saved on this device under SAVE_KEY) comes back,
// and a household size set on Food & Water ("pbr:fw") is used when nothing else is.
// Parties, sleepovers, camping and cookouts stay one tap away below the button.

import { MAX_DAYS, MAX_PEOPLE } from "../stockup/calc";
import { WINTER_MONTHS, kitBySlug } from "./kits";

export type Situation = { kit: string; label: string; emoji: string };

/** How long: a short outage, a week, or the two weeks Ready.gov suggests for staying home. */
export const LENGTHS = [
  { days: 3, label: "3 days" },
  { days: 7, label: "1 week" },
  { days: 14, label: "2 weeks" },
] as const;

const OUTAGE: Situation = { kit: "power-outage", label: "Power outage", emoji: "🔌" };
const WINTER: Situation = { kit: "winter-storm", label: "Winter storm", emoji: "❄️" };
const HEAT: Situation = { kit: "heat-wave", label: "Heat wave", emoji: "🌡️" };
const HURRICANE: Situation = { kit: "hurricane", label: "Hurricane", emoji: "🌀" };
const WATER: Situation = { kit: "water-storage", label: "Water shutoff", emoji: "💧" };
const BASIC: Situation = { kit: "five-day-emergency", label: "Emergency kit", emoji: "🔦" };

/** Four emergencies for a month (1–12): outage first, the season's storm second, then water and the basic kit. */
export function situationsFor(month: number): Situation[] {
  const storm = WINTER_MONTHS.includes(month) ? WINTER : [6, 7, 8, 9].includes(month) ? HEAT : HURRICANE;
  return [OUTAGE, storm, WATER, BASIC];
}

/** Every situation any month can show (a saved choice from another season still opens). */
export const ALL_SITUATIONS: Situation[] = [OUTAGE, WINTER, HEAT, HURRICANE, WATER, BASIC];

export type HomePlan = { kit: string; people: number; days: number };

/** A fresh visit: a short power outage for a household of 4. */
export const FRESH: HomePlan = { kit: OUTAGE.kit, people: 4, days: 3 };

export const SAVE_KEY = "pbr:home-plan";

const whole = (x: unknown, lo: number, hi: number) =>
  typeof x === "number" && Number.isInteger(x) && x >= lo && x <= hi ? x : undefined;

/**
 * The plan home opens with. `saved` is this device's own last choice on home (if any),
 * `fw` the Food & Water picker's saved numbers (older saved state: only its people is used).
 * Anything unreadable falls back to the fresh plan, one field at a time.
 */
export function startingPlan(saved: unknown, fw: unknown): HomePlan {
  const s = (saved && typeof saved === "object" ? saved : {}) as Record<string, unknown>;
  const f = (fw && typeof fw === "object" ? fw : {}) as Record<string, unknown>;
  const kit = typeof s.kit === "string" && ALL_SITUATIONS.some((x) => x.kit === s.kit) ? s.kit : FRESH.kit;
  const people = whole(s.people, 1, MAX_PEOPLE) ?? whole(f.people, 1, MAX_PEOPLE) ?? FRESH.people;
  const days = whole(s.days, 1, MAX_DAYS) ?? FRESH.days;
  return { kit, people, days };
}

/** The checklist this opens: the kit page with these amounts. */
export const planHref = (p: HomePlan) => `/kits/${p.kit}?people=${p.people}&days=${p.days}`;

/** One line saying what the button will open. */
export function planSummary(p: HomePlan): string {
  const s = ALL_SITUATIONS.find((x) => x.kit === p.kit) ?? ALL_SITUATIONS[0];
  const len = LENGTHS.find((l) => l.days === p.days)?.label ?? `${p.days} days`;
  return `${s.label} · ${p.people} ${p.people === 1 ? "person" : "people"} · ${len}`;
}

/** Everyday plans, one tap below the emergency planner. */
export const EVERYDAY = [
  { kit: "kids-sleepover", label: "Sleepover", emoji: "🛌" },
  { kit: "birthday-party", label: "Birthday party", emoji: "🎂" },
  { kit: "weekend-camping", label: "Camping", emoji: "⛺" },
  { kit: "backyard-bbq", label: "Cookout", emoji: "🍔" },
] as const;

/** Every kit named here exists (checked by the tests too). */
export const allKitsExist = () => [...ALL_SITUATIONS, ...EVERYDAY].every((x) => !!kitBySlug(x.kit));
