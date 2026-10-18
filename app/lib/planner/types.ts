// Household planner types. Data (catalog.ts, sources.ts) and math (calc.ts)
// share these; nothing here touches React or the browser.

export type BucketId =
  | "water" | "food" | "health" | "power" | "sanitation" | "warmth" | "comms" | "family";

export type ScenarioId = "outage" | "weather" | "water" | "evacuation";

/** essential: on the Red Cross minimum list or a core Ready.gov kit item.
 *  next: other items the sources list, or things that help for a chosen situation.
 *  optional: sources say "consider" or "depending on where you live". */
export type Priority = "essential" | "next" | "optional";

/** official: the number comes from the cited source.
 *  derived: an official daily rate, multiplied out by us past what the source states.
 *  suggestion: the source lists the item but gives no number; the amount is ours.
 *  none: a task with no quantity. */
export type Basis = "official" | "derived" | "suggestion" | "none";

/** Only households with this need see the item. */
export type NeedFlag =
  | "baby" | "child" | "pet" | "olderAdult"
  | "takesMeds" | "electricMedical" | "mobility" | "senseComm";

export type Subject = "household" | "people" | "adults" | "children" | "babies" | "olderAdults" | "pets";

export type QtyRule =
  /** Same for every household, however long the plan. */
  | { kind: "fixed"; n: number }
  /** Count of the subject, times n. */
  | { kind: "each"; subject: Subject; n: number }
  /** Count of the subject, times the plan's days, times n. */
  | { kind: "daily"; subject: Subject; n: number }
  /** Enough containers of size `per` to hold another item's quantity. */
  | { kind: "coverOf"; itemId: string; per: number }
  /** Nothing to count (a task). */
  | { kind: "none" };

export type Unit = { one: string; many: string };

export type SourceId =
  | "rc-kit" | "rg-kit" | "rg-water" | "rg-food" | "rg-power" | "rg-pets"
  | "rg-disability" | "rg-older" | "rg-plan" | "rg-financial" | "rg-winter"
  | "rg-evacuation" | "cdc-water";

export type Source = {
  id: SourceId;
  agency: string;
  title: string;
  href: string;
  /** The date this site last read the page (ISO). */
  checked: string;
  /** The "Last updated" date the page itself shows, when it shows one. */
  pageUpdated?: string;
};

export type ProductRef = {
  /** Must be an ASIN already in gear.ts (title-verified there). */
  asin: string;
  /** How many item units one product covers; absent means one product is an example. */
  covers?: number;
};

export type CatalogItem = {
  id: string;
  bucket: BucketId;
  name: string;
  unit: Unit;
  qty: QtyRule;
  priority: Priority;
  basis: Basis;
  reason: string;
  sources: SourceId[];
  tip?: string;
  needs?: NeedFlag;
  /** Shown only when one of these situations is picked. */
  scenarioOnly?: ScenarioId[];
  /** Picking a situation can raise (never lower) the priority. */
  raise?: Partial<Record<ScenarioId, Priority>>;
  /** Doubles with the hot-weather option (water only). */
  hotWeather?: boolean;
  /** Rough planning cost per unit, USD. Absent means not something you buy. */
  cost?: number;
  product?: ProductRef;
};

export type Household = {
  people: number;
  children: number;
  babies: number;
  olderAdults: number;
  pets: number;
  takesMeds: boolean;
  electricMedical: boolean;
  mobility: boolean;
  senseComm: boolean;
};

export type HorizonMode = "3d" | "2w" | "1m" | "custom";
export type Horizon = { mode: HorizonMode; amount: number; unit: "weeks" | "months" };

export type ItemStatus = "needs" | "have" | "skip";
export type ItemState = {
  status: ItemStatus;
  /** Overrides the suggested quantity. */
  qty?: number;
  /** How many the household already has (when status is "needs"). */
  have?: number;
  /** Overrides the rough unit cost. */
  cost?: number;
};

export type Budget = { total: number | null; buckets: Partial<Record<BucketId, number>> };

export type PlanState = {
  household: Household;
  horizon: Horizon;
  scenarios: ScenarioId[];
  hotWeather: boolean;
  items: Record<string, ItemState>;
  budget: Budget;
  /** Item ids the visitor picked for "my picks" shopping. */
  picks: string[];
};

/** A catalog item resolved for one household, duration and set of situations. */
export type ResolvedItem = CatalogItem & {
  /** Suggested quantity for the whole plan; null for tasks. */
  suggested: number | null;
  /** Suggested quantity for the first 3 days (equals suggested when not time-scaled). */
  suggested3: number | null;
  /** Priority after the chosen situations. */
  effective: Priority;
  /** Basis after the plan length (official rates past 2 weeks are "derived"). */
  effectiveBasis: Basis;
  /** Situations that added or raised this item. */
  because: ScenarioId[];
};
