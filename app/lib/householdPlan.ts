// Household emergency plan: who to call, where to meet, medical details.
// Sections and field names follow Ready.gov's Family Emergency Communication
// Plan form (READY_FORM_URL) and the four steps on READY_PLAN_URL.
// Everything stays in this browser: one localStorage key, never a URL,
// never measured (locked in householdPlan.test.ts).

export const PLAN_KEY = "pbr:household-plan:v1";
export const READY_PLAN_URL = "https://www.ready.gov/plan";
export const READY_FORM_URL = "https://www.ready.gov/plan-form";
export const POISON_HELP = "1-800-222-1222";
export const POISON_HELP_URL = "https://poisonhelp.hrsa.gov/";

export type Person = { name: string; mobile: string; other: string; email: string; notes: string };
export type Place = { name: string; address: string; phone: string; website: string; pickup: string };
export type Contact = { name: string; mobile: string; home: string; email: string; address: string };
export type Meeting = { location: string; instructions: string };
export type Medical = { poison: string; doctor: string; pediatrician: string; allergies: string; insurance: string; devices: string; vet: string };
export type HouseholdPlan = {
  v: 1;
  home: { phone: string; address: string };
  people: Person[];
  places: Place[];
  contacts: Contact[];
  meeting: Meeting[];
  medical: Medical;
  updated: string;
};
export type Row = "people" | "places" | "contacts" | "meeting";

export const MAX_ROWS: Record<Row, number> = { people: 12, places: 8, contacts: 6, meeting: 4 };
export const MAX_FIELD = 300;

const blank = <T extends string>(keys: readonly T[]) => Object.fromEntries(keys.map((k) => [k, ""])) as Record<T, string>;
const PERSON = ["name", "mobile", "other", "email", "notes"] as const;
const PLACE = ["name", "address", "phone", "website", "pickup"] as const;
const CONTACT = ["name", "mobile", "home", "email", "address"] as const;
const MEETING = ["location", "instructions"] as const;
const MEDICAL = ["poison", "doctor", "pediatrician", "allergies", "insurance", "devices", "vet"] as const;

export const newRow = {
  people: (): Person => blank(PERSON),
  places: (): Place => blank(PLACE),
  contacts: (): Contact => blank(CONTACT),
  meeting: (): Meeting => blank(MEETING),
};

export function emptyPlan(): HouseholdPlan {
  return {
    v: 1,
    home: { phone: "", address: "" },
    people: [newRow.people(), newRow.people()],
    places: [newRow.places()],
    contacts: [newRow.contacts()],
    meeting: [newRow.meeting(), newRow.meeting()],
    medical: { ...blank(MEDICAL), poison: POISON_HELP },
    updated: "",
  };
}

const str = (v: unknown) => (typeof v === "string" ? v.slice(0, MAX_FIELD) : "");
function fields<T extends string>(keys: readonly T[], v: unknown): Record<T, string> {
  const o = v && typeof v === "object" ? (v as Record<string, unknown>) : {};
  return Object.fromEntries(keys.map((k) => [k, str(o[k])])) as Record<T, string>;
}
function rows<T extends string>(keys: readonly T[], v: unknown, max: number, min: number): Record<T, string>[] {
  const list = Array.isArray(v) ? v.slice(0, max).map((x) => fields(keys, x)) : [];
  while (list.length < min) list.push(blank(keys));
  return list;
}

/** Reads a saved plan. Anything missing, broken or from another version gives a fresh plan. */
export function parsePlan(raw: string | null | undefined): HouseholdPlan {
  if (!raw) return emptyPlan();
  let d: unknown;
  try { d = JSON.parse(raw); } catch { return emptyPlan(); }
  if (!d || typeof d !== "object" || (d as { v?: unknown }).v !== 1) return emptyPlan();
  const o = d as Record<string, unknown>;
  return {
    v: 1,
    home: fields(["phone", "address"] as const, o.home),
    people: rows(PERSON, o.people, MAX_ROWS.people, 1),
    places: rows(PLACE, o.places, MAX_ROWS.places, 1),
    contacts: rows(CONTACT, o.contacts, MAX_ROWS.contacts, 1),
    meeting: rows(MEETING, o.meeting, MAX_ROWS.meeting, 1),
    medical: fields(MEDICAL, o.medical),
    updated: str(o.updated),
  };
}

type Store = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export function loadPlan(store: Store | null | undefined): HouseholdPlan {
  try { return parsePlan(store?.getItem(PLAN_KEY)); } catch { return emptyPlan(); }
}
export function savePlan(store: Store | null | undefined, plan: HouseholdPlan, now = new Date()): HouseholdPlan {
  const next = { ...plan, updated: now.toISOString().slice(0, 10) };
  try { store?.setItem(PLAN_KEY, JSON.stringify(next)); } catch { /* storage full or blocked: the page still works */ }
  return next;
}
export function erasePlan(store: Store | null | undefined): HouseholdPlan {
  try { store?.removeItem(PLAN_KEY); } catch { /* nothing saved */ }
  return emptyPlan();
}

const has = (r: Record<string, string>) => Object.values(r).some((v) => v.trim());
/** True when nothing but the prefilled Poison Help number is filled in. */
export function isEmpty(p: HouseholdPlan): boolean {
  const med = { ...p.medical, poison: p.medical.poison === POISON_HELP ? "" : p.medical.poison };
  return !has(p.home) && !has(med) && ![...p.people, ...p.places, ...p.contacts, ...p.meeting].some(has);
}

/** Filled rows only, for the printed sheet. */
export function filledRows<T extends Record<string, string>>(list: T[]): T[] {
  return list.filter(has);
}

/** The few lines worth carrying in a wallet or backpack. Only what is filled in. */
export function walletLines(p: HouseholdPlan): string[] {
  const join = (...parts: string[]) => parts.map((s) => s.trim()).filter(Boolean).join(" · ");
  const lines: string[] = [];
  for (const m of filledRows(p.people).slice(0, 4)) lines.push(join(m.name, m.mobile));
  const c = filledRows(p.contacts)[0];
  if (c) lines.push(`Emergency contact: ${join(c.name, c.mobile || c.home)}`);
  const meet = filledRows(p.meeting)[0];
  if (meet?.location.trim()) lines.push(`Meet at: ${meet.location.trim()}`);
  if (p.home.address.trim()) lines.push(`Home: ${p.home.address.trim()}`);
  if (p.medical.poison.trim()) lines.push(`Poison Help: ${p.medical.poison.trim()}`);
  return lines.filter((l) => l.replace(/^[^:]+:\s*$/, "").trim());
}
