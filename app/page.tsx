
const A = "#34D399";

// Amazon Associates tag (Open Mirror LLC account). NEXT_PUBLIC_AMAZON_TAG overrides.
const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_TAG ?? "pleasebeready-20";
const amazonUrl = (asin: string) =>
  `https://www.amazon.com/dp/${asin}${AMAZON_TAG ? `?tag=${AMAZON_TAG}` : ""}`;

type GearItem = { name: string; asin: string };
type Area = { emoji: string; title: string; details: string[]; href: string; source: string; gear: GearItem[] };

const areas: Area[] = [
  {
    emoji: "💧", title: "Water", href: "https://www.ready.gov/water", source: "Ready.gov",
    details: [
      "1 gallon per person per day (drinking + sanitation); don't forget pets.",
      "Store a 3-day minimum; aim for 2 weeks. Rotate store-bought every 6–12 months.",
      "Backup purification: filter, unscented bleach (8 drops/gallon), or a rolling boil for 1 minute.",
    ],
    gear: [
      { name: "Reliance Aqua-Tainer 7-gallon water container", asin: "B001QC31G6" },
      { name: "LifeStraw personal water filter", asin: "B006QF3TW4" },
    ],
  },
  {
    emoji: "🥫", title: "Food", href: "https://www.ready.gov/food", source: "Ready.gov",
    details: [
      "2-week supply of non-perishable, no-cook food — roughly 2,000 calories/person/day.",
      "Canned meat/beans/veg, peanut butter, nuts, dried fruit, crackers, shelf-stable milk.",
      "Keep a manual can opener. Rotate by expiration date.",
    ],
    gear: [
      { name: "Mountain House 3-day emergency food supply", asin: "B0898QSCNG" },
      { name: "Heavy-duty manual can opener", asin: "B09HKDZ3CV" },
    ],
  },
  {
    emoji: "🩹", title: "First Aid & Meds", href: "https://www.redcross.org/get-help/how-to-prepare-for-emergencies/survival-kit-supplies.html", source: "Red Cross",
    details: [
      "Stocked first-aid kit + a printed list of everyone's medications and doses.",
      "7–30 day backup of prescriptions where possible.",
      "OTC: pain reliever, antihistamine, anti-diarrheal, electrolytes.",
    ],
    gear: [
      { name: "First Aid Only 298-piece all-purpose kit", asin: "B000069EYA" },
    ],
  },
  {
    emoji: "🔦", title: "Power & Light", href: "https://www.ready.gov/power-outages", source: "Ready.gov",
    details: [
      "LED flashlights + headlamps, plenty of spare batteries, 1–2 charged power banks.",
      "NOAA hand-crank / solar radio.",
      "Generators run outdoors only, 20+ ft from windows and doors (carbon monoxide kills).",
    ],
    gear: [
      { name: "Energizer LED headlamps, 2-pack with batteries", asin: "B092RHC2FY" },
      { name: "Anker 10,000mAh USB-C power bank", asin: "B0D5CLSMFB" },
    ],
  },
  {
    emoji: "🔥", title: "Heat & Shelter", href: "https://www.ready.gov/winter-weather", source: "Ready.gov",
    details: [
      "Wool or mylar blankets, sleeping bags rated to your local lows, layered clothing, hand warmers.",
      "Never run a grill, camp stove, or generator indoors.",
      "Working carbon-monoxide detector with fresh batteries.",
    ],
    gear: [
      { name: "Swiss Safe mylar emergency blankets, 4-pack", asin: "B01LYNWRLA" },
      { name: "HotHands hand warmers, 10 pair", asin: "B077RXSZN3" },
    ],
  },
  {
    emoji: "📻", title: "Communication & Plan", href: "https://www.ready.gov/make-a-plan", source: "Ready.gov",
    details: [
      "NOAA weather radio + a written contact list (paper, not just your phone).",
      "Pick one out-of-town contact everyone checks in with.",
      "Two meeting spots: near home, and outside the neighborhood. Text over call in outages.",
    ],
    gear: [
      { name: "Midland ER310 hand-crank NOAA weather radio", asin: "B015QIC1PW" },
    ],
  },
  {
    emoji: "📄", title: "Documents & Cash", href: "https://www.ready.gov/financial-preparedness", source: "Ready.gov / FEMA EFFAK",
    details: [
      "Copies of IDs, insurance, deeds/leases, medical + Rx, and contacts.",
      "Keep them in a waterproof bag and in encrypted cloud storage.",
      "Cash in small bills — ATMs and card readers may be down.",
    ],
    gear: [
      { name: "Fireproof, waterproof document bag with lock", asin: "B07SPZ93V5" },
    ],
  },
  {
    emoji: "🎒", title: "72-Hour Go-Bag", href: "https://www.ready.gov/kit", source: "Ready.gov",
    details: [
      "One per person, by the door. 3 days of water + no-cook food.",
      "First aid, meds, flashlight, radio, charger, cash, document copies.",
      "Sanitation, change of clothes, sturdy shoes, whistle, emergency blanket.",
    ],
    gear: [
      { name: "Ready America 72-hour kit, 2-person backpack", asin: "B000FJQQVI" },
    ],
  },
  {
    emoji: "🚗", title: "Car Kit", href: "https://www.ready.gov/car", source: "Ready.gov",
    details: [
      "Jumper cables, blanket, water, snacks, flashlight, first-aid kit.",
      "Phone charger, small tool kit, ice scraper.",
      "Flares or reflective triangles; keep the tank at least half full.",
    ],
    gear: [
      { name: "90-piece roadside kit: jumper cables, first aid, tools", asin: "B01C96AFWU" },
    ],
  },
  {
    emoji: "🏠", title: "Home Safety", href: "https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/home-fires.html", source: "Red Cross",
    details: [
      "Smoke + CO detectors on every level; test monthly.",
      "Fire extinguisher you know how to use (remember PASS: Pull, Aim, Squeeze, Sweep).",
      "Know how to shut off water, gas, and electricity. Keep two exits clear.",
    ],
    gear: [
      { name: "First Alert HOME1 fire extinguisher", asin: "B01LTICQYE" },
      { name: "First Alert smoke + CO combo alarm", asin: "B000MXJ498" },
    ],
  },
  {
    emoji: "🤝", title: "Skills & Community", href: "https://www.ready.gov/cert", source: "FEMA CERT",
    details: [
      "Learn first aid and CPR.",
      "Consider joining a Community Emergency Response Team (CERT).",
      "Know which neighbors have medical, trade, or equipment resources. Practice your plan twice a year.",
    ],
    gear: [
      { name: "Red Cross First Aid/CPR/AED manual", asin: "173674478X" },
    ],
  },
];

const levels = [
  { tag: "Level 1", title: "72 Hours", text: "The baseline everyone should hit: ride out a storm, outage, or evacuation." },
  { tag: "Level 2", title: "2 Weeks", text: "FEMA's current guidance for many disasters. Water, food, meds, and power for two weeks." },
  { tag: "Level 3", title: "1 Month+", text: "Extended resilience for longer disruptions — build here once Levels 1–2 are solid." },
];

const resources = [
  { label: "Ready.gov — Build a Kit", href: "https://www.ready.gov/kit" },
  { label: "Ready.gov — Make a Plan", href: "https://www.ready.gov/make-a-plan" },
  { label: "FEMA App (alerts + checklists)", href: "https://www.fema.gov/about/news-multimedia/mobile-products" },
  { label: "American Red Cross — Prepare", href: "https://www.redcross.org/get-help/how-to-prepare-for-emergencies.html" },
  { label: "CDC — Emergency Preparedness", href: "https://www.cdc.gov/orr/index.html" },
];

export default function PleaseBeReady() {
  return (
    <main className="min-h-screen bg-[#0b1220] text-[#e8edf5]">
      <div className="mx-auto max-w-3xl px-5 py-12">

        <div className="mb-8 inline-flex items-baseline text-lg font-black tracking-tight">
          <span className="text-[#e8edf5]">PleaseBeReady</span>
          <span style={{ color: A }}>.com</span>
        </div>

        <section className="mb-12">
          <h1 className="mb-3 text-4xl font-black leading-tight sm:text-5xl">Emergency Preparedness Checklists</h1>
          <p className="max-w-2xl text-base font-semibold leading-7 text-[#94a3b8]">
            Water, food, power, medical, documents, and a go-bag — what to store, how much, and where to learn more.
            Every section lists the exact gear to get and links to an official guide (Ready.gov, FEMA, Red Cross, CDC).
          </p>
        </section>

        <section className="mb-12">
          <div className="grid gap-4 sm:grid-cols-2">
            {areas.map((a) => (
              <div key={a.title} className="pop flex flex-col rounded-2xl border border-[#26324c] bg-[#141d2e] p-6">
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-2xl">{a.emoji}</span>
                  <h2 className="text-lg font-black text-[#e8edf5]">{a.title}</h2>
                </div>
                <ul className="mb-4 flex flex-1 flex-col gap-2">
                  {a.details.map((d) => (
                    <li key={d} className="flex gap-2 text-sm font-semibold leading-6 text-[#C8C0B4]">
                      <span style={{ color: A }}>✓</span><span>{d}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex flex-col gap-2">
                  {a.gear.map((g) => (
                    <a key={g.asin} href={amazonUrl(g.asin)} target="_blank" rel="noopener noreferrer sponsored"
                      className="inline-flex items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-xs font-black transition hover:opacity-90"
                      style={{ background: A, color: "#0b1220" }}>
                      <span>🛒 {g.name}</span><span>→</span>
                    </a>
                  ))}
                  <a href={a.href} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center justify-between rounded-xl border border-[#26324c] bg-[#1c2740] px-4 py-2.5 text-xs font-black uppercase tracking-[0.1em] transition hover:border-[#1c2740]"
                    style={{ color: A }}>
                    <span>Guide · {a.source}</span><span>→</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-xl font-black">Supply Levels</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {levels.map((l) => (
              <div key={l.title} className="pop rounded-2xl border border-[#26324c] bg-[#141d2e] p-5">
                <p className="text-xs font-black uppercase tracking-[0.15em]" style={{ color: A }}>{l.tag}</p>
                <h3 className="mt-1 text-lg font-black">{l.title}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#94a3b8]">{l.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12 rounded-3xl border border-[#26324c] bg-[#141d2e] p-7">
          <h2 className="mb-4 text-xl font-black">Official Resources</h2>
          <div className="flex flex-col gap-2">
            {resources.map((r) => (
              <a key={r.href} href={r.href} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-[#26324c] bg-[#1c2740] px-5 py-3.5 text-sm font-black text-[#e8edf5] transition hover:border-[#1c2740]">
                <span>{r.label}</span><span style={{ color: A }}>→</span>
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
