import ChecklistLines from "./components/ChecklistLines";
import ClickMeasure from "./components/ClickMeasure";
import GearList from "./components/GearList";
import StartHere from "./components/StartHere";
import SupplyMath from "./components/SupplyMath";
import { areas, levels, resources } from "./lib/readiness";

const A = "#34D399";

// Three kinds of help, labelled once near the top so nothing on the page is
// mistaken for something else. There is no paid tool today; say so plainly
// rather than hint at one.
const lanes = [
  { title: "Free help", text: "Every checklist, guide link, and tool on this site. No account." },
  { title: "Gear picks 🛒", text: "Optional Amazon links, folded under each section. They may earn us a commission." },
  { title: "Paid tools", text: "None yet. If one is ever offered, it will show its price before you click." },
];

export default function PleaseBeReady() {
  return (
    <main className="min-h-screen bg-[#0b1220] text-[#e8edf5]">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-5 sm:py-12">

        <div className="mb-6 inline-flex items-baseline text-lg font-black tracking-tight">
          <span className="text-[#e8edf5]">PleaseBeReady</span>
          <span style={{ color: A }}>.com</span>
        </div>

        <section className="mb-8">
          <h1 className="mb-3 text-4xl font-black leading-tight sm:text-5xl">Get your household ready, one step at a time</h1>
          <p className="max-w-2xl text-base font-semibold leading-7 text-[#94a3b8]">
            Free checklists for water, food, power, medicine, documents, and a go-bag, each linked to an official guide
            (Ready.gov, FEMA, Red Cross, CDC).
          </p>
        </section>

        <ClickMeasure />
        <StartHere />

        <ul aria-label="What's on this site" className="mb-12 flex flex-col gap-2 rounded-2xl border border-[#26324c] bg-[#141d2e] px-5 py-4 sm:flex-row sm:gap-6">
          {lanes.map((l) => (
            <li key={l.title} className="flex-1 text-xs font-semibold leading-5 text-[#94a3b8]">
              <span className="font-black text-[#e8edf5]">{l.title}:</span> {l.text}
            </li>
          ))}
        </ul>

        <SupplyMath />

        <a href="/today"
          className="mb-12 flex items-center justify-between gap-2 rounded-xl border border-[#26324c] bg-[#141d2e] px-4 py-3 text-sm font-black transition hover:border-[#34D399]"
          style={{ color: A }}>
          <span>📅 Daily Readiness Check — one small task a day</span><span aria-hidden>→</span>
        </a>

        <section id="checklist" aria-labelledby="checklist-title" className="mb-12 scroll-mt-20">
          <h2 id="checklist-title" className="mb-1 text-xl font-black">The full checklist</h2>
          <p className="mb-4 text-xs font-semibold leading-5 text-[#94a3b8]">
            Eleven areas. Check off what you already have; marks stay on this device only.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {areas.map((a) => (
              <div key={a.id} id={a.id} className="flex scroll-mt-20 flex-col gap-4 rounded-2xl border border-[#26324c] bg-[#141d2e] p-6">
                <h3 className="flex items-center gap-3 text-lg font-black text-[#e8edf5]">
                  <span aria-hidden className="text-2xl">{a.emoji}</span>{a.title}
                </h3>
                <div className="flex-1"><ChecklistLines areaId={a.id} details={a.details} /></div>
                <a href={a.href} target="_blank" rel="noopener noreferrer" data-measure="guide" data-measure-label={a.id}
                  className="inline-flex items-center justify-between rounded-xl border border-[#26324c] bg-[#1c2740] px-4 py-2.5 text-xs font-black uppercase tracking-[0.1em] transition hover:border-[#34D399]"
                  style={{ color: A }}>
                  <span>Guide · {a.source}</span><span aria-hidden>→</span>
                </a>
                <GearList gear={a.gear} />
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-xl font-black">Supply Levels</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {levels.map((l) => (
              <div key={l.title} className="flex flex-col gap-3 rounded-2xl border border-[#26324c] bg-[#141d2e] p-5">
                <p className="text-xs font-black uppercase tracking-[0.15em]" style={{ color: A }}>{l.tag}</p>
                <h3 className="-mt-2 text-lg font-black">{l.title}</h3>
                <p className="flex-1 text-sm font-semibold leading-6 text-[#94a3b8]">{l.text}</p>
                <GearList gear={l.gear} />
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12 rounded-3xl border border-[#26324c] bg-[#141d2e] p-6 sm:p-7">
          <h2 className="mb-4 text-xl font-black">Official Resources</h2>
          <div className="flex flex-col gap-2">
            {resources.map((r) => (
              <a key={r.href} href={r.href} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-[#26324c] bg-[#1c2740] px-5 py-3.5 text-sm font-black text-[#e8edf5] transition hover:border-[#34D399]">
                <span>{r.label}</span><span style={{ color: A }} aria-hidden>→</span>
              </a>
            ))}
          </div>
        </section>

        <div className="pt-8 text-center">
          <p className="mx-auto max-w-xl text-xs font-semibold leading-6 text-[#94a3b8]">
            General preparedness information, not professional or medical advice. In any emergency, call your local
            emergency number and follow official guidance from local authorities.
          </p>
          <p className="mx-auto mt-3 max-w-xl text-xs font-semibold leading-6 text-[#94a3b8]">
            As an Amazon Associate, PleaseBeReady earns from qualifying purchases.
          </p>
        </div>

      </div>
    </main>
  );
}
