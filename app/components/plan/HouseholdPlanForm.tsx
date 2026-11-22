"use client";

// The household plan form. Saved in this browser only (lib/householdPlan.ts);
// nothing typed here is sent, measured or put in a link.

import { useEffect, useState, type ReactNode } from "react";
import {
  MAX_FIELD, MAX_ROWS, POISON_HELP_URL, erasePlan, filledRows, isEmpty, loadPlan, newRow, savePlan, walletLines,
  type HouseholdPlan, type Medical, type Row,
} from "../../lib/householdPlan";

type Kind = "text" | "tel" | "email" | "url" | "area";
type FieldDef = [key: string, label: string, kind?: Kind];

const SECTIONS: { key: Row; title: string; note?: string; one: string; add: string; fields: FieldDef[] }[] = [
  {
    key: "people", title: "Household members", one: "Person", add: "Add a person",
    fields: [["name", "Name"], ["mobile", "Mobile", "tel"], ["other", "Other number or social media"], ["email", "Email", "email"], ["notes", "Important medical or other information", "area"]],
  },
  {
    key: "places", title: "Schools, childcare, caregivers and workplaces", one: "Place", add: "Add a place",
    note: "Where people spend the day, and how pick-up works there in an emergency.",
    fields: [["name", "Name"], ["address", "Address"], ["phone", "Emergency or hotline number", "tel"], ["website", "Website", "url"], ["pickup", "Emergency plan or pick-up", "area"]],
  },
  {
    key: "contacts", title: "Emergency contacts", one: "Contact", add: "Add a contact",
    fields: [["name", "Name"], ["mobile", "Mobile", "tel"], ["home", "Home number", "tel"], ["email", "Email", "email"], ["address", "Address"]],
  },
  {
    key: "meeting", title: "Emergency meeting places", one: "Meeting place", add: "Add a meeting place",
    note: "Pick a place that's familiar and easy to find.",
    fields: [["location", "Location"], ["instructions", "Instructions", "area"]],
  },
];

const MEDICAL: [keyof Medical, string, Kind?][] = [
  ["poison", "Poison control", "tel"], ["doctor", "Doctor", "tel"], ["pediatrician", "Pediatrician", "tel"],
  ["allergies", "Allergies and prescriptions", "area"], ["insurance", "Medical insurance"],
  ["devices", "Assistive devices (make, model, supplier, serial number)", "area"], ["vet", "Veterinarian", "tel"],
];

const input = "w-full rounded-xl border-2 border-[#26324c] bg-[#0c1220] px-3 text-base font-semibold text-[#e8edf5]";
const btn = "min-h-11 rounded-xl border-2 border-[#26324c] px-4 text-sm font-black text-[#e8edf5]";

function Field({ id, label, kind = "text", value, onChange }: { id: string; label: string; kind?: Kind; value: string; onChange: (v: string) => void }) {
  const common = { id, value, maxLength: MAX_FIELD, autoComplete: "off", onChange: (e: { target: { value: string } }) => onChange(e.target.value) };
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1 block text-xs font-black text-[#94a3b8]">{label}</span>
      {kind === "area"
        ? <textarea {...common} rows={2} className={`${input} py-2 leading-6`} />
        : <input {...common} type={kind} inputMode={kind === "tel" ? "tel" : kind === "email" ? "email" : undefined} className={`${input} h-11`} />}
    </label>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border-2 border-[#26324c] bg-[#141d2e] p-4 sm:p-5">
      <h2 className="text-lg font-black text-[#e8edf5]">{title}</h2>
      {note ? <p className="pbr-body mt-1 text-sm font-semibold">{note}</p> : null}
      <div className="mt-3 space-y-4">{children}</div>
    </section>
  );
}

export default function HouseholdPlanForm() {
  const [plan, setPlan] = useState<HouseholdPlan | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read this device's saved plan once, after hydration
    setPlan(loadPlan(typeof window === "undefined" ? null : window.localStorage));
  }, []);

  if (!plan) return <p className="text-sm font-bold text-[#94a3b8]">Opening your plan…</p>;

  const store = () => (typeof window === "undefined" ? null : window.localStorage);
  const update = (next: HouseholdPlan) => setPlan(savePlan(store(), next));
  const setRow = (key: Row, i: number, field: string, v: string) =>
    update({ ...plan, [key]: plan[key].map((r, j) => (j === i ? { ...r, [field]: v } : r)) } as HouseholdPlan);
  const addRow = (key: Row) => update({ ...plan, [key]: [...plan[key], newRow[key]()] } as HouseholdPlan);
  const removeRow = (key: Row, i: number) => update({ ...plan, [key]: plan[key].filter((_, j) => j !== i) } as HouseholdPlan);
  const erase = () => {
    if (window.confirm("Erase this plan from this device? This can't be undone.")) setPlan(erasePlan(store()));
  };

  const updated = plan.updated ? new Date(`${plan.updated}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "";
  const wallet = walletLines(plan);

  return (
    <>
      <div className="space-y-4 print:hidden">
        <Section title="Household">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="home-phone" label="Home phone" kind="tel" value={plan.home.phone} onChange={(v) => update({ ...plan, home: { ...plan.home, phone: v } })} />
            <Field id="home-address" label="Address" value={plan.home.address} onChange={(v) => update({ ...plan, home: { ...plan.home, address: v } })} />
          </div>
        </Section>

        {SECTIONS.map((s) => (
          <Section key={s.key} title={s.title} note={s.note}>
            {plan[s.key].map((row, i) => (
              <fieldset key={i} className="rounded-xl border-2 border-[#26324c] p-3">
                <legend className="px-1 text-xs font-black uppercase tracking-wider text-[#94a3b8]">{s.one} {i + 1}</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {s.fields.map(([f, label, kind]) => (
                    <div key={f} className={kind === "area" ? "sm:col-span-2" : ""}>
                      <Field id={`${s.key}-${i}-${f}`} label={label} kind={kind} value={(row as Record<string, string>)[f]} onChange={(v) => setRow(s.key, i, f, v)} />
                    </div>
                  ))}
                </div>
                {plan[s.key].length > 1 ? (
                  <button type="button" onClick={() => removeRow(s.key, i)} className="mt-3 min-h-11 text-sm font-black text-[#94a3b8] underline">
                    Remove {s.one.toLowerCase()} {i + 1}
                  </button>
                ) : null}
              </fieldset>
            ))}
            {plan[s.key].length < MAX_ROWS[s.key] ? (
              <button type="button" onClick={() => addRow(s.key)} className={btn}>+ {s.add}</button>
            ) : null}
          </Section>
        ))}

        <Section title="Medical information">
          <div className="grid gap-3 sm:grid-cols-2">
            {MEDICAL.map(([f, label, kind]) => (
              <div key={f} className={kind === "area" ? "sm:col-span-2" : ""}>
                <Field id={`medical-${f}`} label={label} kind={kind} value={plan.medical[f]} onChange={(v) => update({ ...plan, medical: { ...plan.medical, [f]: v } })} />
              </div>
            ))}
          </div>
          <p className="text-xs font-semibold text-[#94a3b8]">
            Poison control starts with the national Poison Help line (
            <a href={POISON_HELP_URL} target="_blank" rel="noopener noreferrer" className="underline">HRSA</a>). Change it if you use another number.
          </p>
        </Section>

        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <span className="text-xs font-bold text-[#94a3b8]" role="status">
            {isEmpty(plan) ? "Kept on this device as you type." : `Saved on this device${updated ? `, ${updated}` : ""}.`}
          </span>
          {!isEmpty(plan) ? (
            <button type="button" onClick={erase} className="min-h-11 text-sm font-black text-[#94a3b8] underline">Erase plan</button>
          ) : null}
        </div>
        <div className="sticky bottom-3 z-10 rounded-2xl border-2 border-[#26324c] bg-[#141d2e] p-2">
          <button type="button" onClick={() => window.print()} className="pbr-edge min-h-11 w-full rounded-xl border-2 bg-[#F97316] px-5 text-sm font-black text-[#0b1220]">
            Print the plan and wallet card
          </button>
        </div>
      </div>

      <PrintSheet plan={plan} updated={updated} wallet={wallet} />
    </>
  );
}

// Paper copy: black on white (globals.css print rules), only what is filled in.
function PrintSheet({ plan, updated, wallet }: { plan: HouseholdPlan; updated: string; wallet: string[] }) {
  const line = (label: string, v: string) => (v.trim() ? <div><b>{label}:</b> {v}</div> : null);
  const block = (title: string, items: ReactNode[]) =>
    items.length ? (
      <section className="mt-3 break-inside-avoid">
        <h3 className="border-b text-sm font-black uppercase">{title}</h3>
        <div className="mt-1 grid grid-cols-2 gap-x-6 gap-y-2 text-[11px] leading-snug">{items}</div>
      </section>
    ) : null;
  const rowsOf = (key: Row) => {
    const s = SECTIONS.find((x) => x.key === key)!;
    return filledRows(plan[key] as Record<string, string>[]).map((r, i) => (
      <div key={i}>{s.fields.map(([f, label]) => <div key={f}>{line(label, r[f])}</div>)}</div>
    ));
  };
  const med = MEDICAL.map(([f, label]) => line(label, plan.medical[f])).filter(Boolean).map((n, i) => <div key={i}>{n}</div>);
  const home = [line("Home phone", plan.home.phone), line("Address", plan.home.address)].filter(Boolean).map((n, i) => <div key={i}>{n}</div>);
  return (
    <div className="hidden print:block">
      <h2 className="text-xl font-black">Our household emergency plan</h2>
      <p className="text-[11px]">{updated ? `Updated ${updated}. ` : ""}Practice it with your household.</p>
      {block("Household", home)}
      {block("Household members", rowsOf("people"))}
      {block("Schools, childcare, caregivers and workplaces", rowsOf("places"))}
      {block("Emergency contacts", rowsOf("contacts"))}
      {block("Emergency meeting places", rowsOf("meeting"))}
      {block("Medical information", med)}
      {wallet.length ? (
        <section className="mt-4 break-inside-avoid">
          <h3 className="text-sm font-black uppercase">Wallet cards: cut out, fold, keep one in each wallet or backpack</h3>
          <div className="mt-2 flex gap-4">
            {[0, 1].map((k) => (
              <div key={k} className="w-[3.4in] rounded border border-dashed p-2 text-[10px] leading-snug">
                <b>Household emergency card</b>
                {wallet.map((l) => <div key={l}>{l}</div>)}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
