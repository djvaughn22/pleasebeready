// The home planner (owner direction 2026-11-20): the page should read at once
// as a planner for real occasions like parties, sleepovers and camping. Pick an
// occasion and how many people; the button opens that plan with amounts for the
// group: a kit page (its ?people= is read by numbersFromQuery in kitPlan.ts) or
// the Food & Water bundle. From November to February the winter storm kit takes
// the power outage spot, as the storm shelf leads the rest of home then.

import { MAX_FW_PEOPLE, bundleHref } from "../ready/bundle";
import { MAX_PEOPLE } from "../stockup/calc";
import { WINTER_MONTHS } from "./kits";

export type Occasion = {
  id: string;
  /** The kit this opens; none for Food & Water. */
  kit?: string;
  label: string;
  emoji: string;
  /** The button's words for this many people. */
  cta: (people: number) => string;
};

const who = (n: number) => `${n} ${n === 1 ? "person" : "people"}`;

const EVENTS: Occasion[] = [
  { id: "kids-sleepover", kit: "kids-sleepover", label: "Sleepover", emoji: "🛌", cta: (n) => `Plan a sleepover for ${n}` },
  { id: "birthday-party", kit: "birthday-party", label: "Birthday party", emoji: "🎂", cta: (n) => `Plan a birthday party for ${n}` },
  { id: "weekend-camping", kit: "weekend-camping", label: "Camping", emoji: "⛺", cta: (n) => `Plan a camping trip for ${n}` },
  { id: "backyard-bbq", kit: "backyard-bbq", label: "Cookout", emoji: "🍔", cta: (n) => `Plan a cookout for ${n}` },
];
const OUTAGE: Occasion = { id: "power-outage", kit: "power-outage", label: "Power outage", emoji: "🔌", cta: (n) => `Plan for a power outage, ${who(n)}` };
const STORM: Occasion = { id: "winter-storm", kit: "winter-storm", label: "Winter storm", emoji: "❄️", cta: (n) => `Plan for a winter storm, ${who(n)}` };
const FOOD_WATER: Occasion = { id: "food-water", label: "Food & water", emoji: "💧", cta: (n) => `Plan food and water for ${n}` };

/** The six occasions on home for a month (1–12): four gatherings and trips, then storm or outage, then Food & Water. */
export const occasionsFor = (month: number): Occasion[] => [...EVENTS, WINTER_MONTHS.includes(month) ? STORM : OUTAGE, FOOD_WATER];

/** Most people the planner takes for this occasion (kits and the Food & Water bundle have their own limits). */
export const maxPeople = (o: Occasion) => (o.kit ? MAX_PEOPLE : MAX_FW_PEOPLE);

/** The plan for this many people: the kit page, or the Food & Water bundle for `days` (this device's last choice, else a week). */
export const occasionHref = (o: Occasion, people: number, days = 7) =>
  o.kit ? `/kits/${o.kit}?people=${people}` : bundleHref(Math.min(people, MAX_FW_PEOPLE), days);
