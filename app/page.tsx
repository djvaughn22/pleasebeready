const A = "#34D399"; // accent

const startHere = [
  { n: "1", title: "Store some water", text: "Aim for 1 gallon per person per day. Start with a 3-day supply, then build toward two weeks. Store-bought jugs are totally fine." },
  { n: "2", title: "Build a 3-day food shelf", text: "Just extra of what you already eat and don't need to cook — canned goods, peanut butter, crackers, granola. Don't forget a manual can opener." },
  { n: "3", title: "Make a simple first-aid kit", text: "Bandages, antiseptic, pain reliever, any daily medications, and a two-week backup of prescriptions if you can." },
  { n: "4", title: "Set aside light + power", text: "A flashlight, spare batteries, and a charged power bank for your phone. Add a headlamp if you want to feel fancy." },
  { n: "5", title: "Protect your info", text: "Photos of your IDs and key documents saved to your phone and the cloud, plus a little cash in small bills." },
];

const areas = [
  { emoji: "💧", title: "Water", intro: "The one thing you can't go without. Easy to store, easy to forget.", items: ["1 gallon per person per day", "Start at 3 days, grow to 2 weeks", "A way to purify (filter, tablets, or just boil)", "Don't forget pets"] },
  { emoji: "🥫", title: "Food", intro: "No survival bricks required — just a comfortable cushion of food you actually like.", items: ["Shelf-stable meals you already eat", "Manual can opener", "Comfort snacks (morale matters!)", "Rotate so nothing expires"] },
  { emoji: "🩹", title: "First Aid & Meds", intro: "Most emergencies are small. A good kit handles the everyday stuff too.", items: ["Basic first-aid kit", "Extra prescription meds", "Pain reliever, allergy meds", "A simple first-aid guide"] },
  { emoji: "🔦", title: "Power & Light", intro: "When the lights go out, a little preparation goes a long way.", items: ["Flashlights + headlamps", "Extra batteries", "Phone power bank", "Optional: small solar charger"] },
  { emoji: "🔥", title: "Heat & Shelter", intro: "Staying warm and dry keeps a bad day from becoming a dangerous one.", items: ["Warm blankets / sleeping bags", "Extra layers and hats", "Hand warmers", "Know how to stay warm safely indoors"] },
  { emoji: "📻", title: "Communication", intro: "Know what's happening and how to reach the people you love.", items: ["Battery or hand-crank radio", "Written list of key phone numbers", "A family meeting spot & plan", "Backup charging for phones"] },
  { emoji: "📄", title: "Documents & Money", intro: "The boring stuff that's a lifesaver when systems are down.", items: ["Copies of IDs, insurance, deeds", "Saved to phone + cloud", "Some cash in small bills", "A written contact list"] },
  { emoji: "🎒", title: "Go-Bag", intro: "A grab-and-go bag by the door, in case you have to leave fast.", items: ["Water, snacks, first aid", "Charger, flashlight, cash", "Change of clothes", "Copies of documents"] },
  { emoji: "🏠", title: "Home Safety", intro: "Simple things that make your home safer every single day.", items: ["Working smoke + CO detectors", "Fire extinguisher you know how to use", "Know how to shut off water/gas", "A clear exit plan"] },
  { emoji: "🤝", title: "Skills & Neighbors", intro: "The most valuable prep isn't stuff — it's people and know-how.", items: ["Meet your neighbors", "Learn basic first aid / CPR", "Practice your plan once a year", "Help someone else get ready"] },
];

const levels = [
  { tag: "Level 1", title: "72 Hours", text: "Ready for a storm, an outage, or a rough couple of days. This is where everyone starts — and it's enough to matter." },
  { tag: "Level 2", title: "2 Weeks", text: "The sweet spot. Enough to ride out most real disruptions comfortably without stress." },
  { tag: "Level 3", title: "1 Month+", text: "Deeper peace of mind for longer events — job loss, extended weather, supply hiccups. Build here only when you're ready." },
];

const resources = [
  { label: "Ready.gov — official U.S. prep guides", href: "https://www.ready.gov" },
  { label: "American Red Cross — emergency prep", href: "https://www.redcross.org/get-help/how-to-prepare-for-emergencies.html" },
  { label: "CDC — emergency preparedness", href: "https://emergency.cdc.gov/preparedness/" },
  { label: "FEMA — build a kit", href: "https://www.ready.gov/kit" },
];

export default function PleaseBeReady() {
  return (
    <main className="min-h-screen bg-[#0C0C0C] text-[#F5F0E8]">
      <div className="mx-auto max-w-3xl px-5 py-10">

        {/* Brand bar */}
        <div className="mb-12 flex items-center justify-between">
          <div className="inline-flex items-baseline text-lg font-black tracking-tight">
            <span className="text-[#F5F0E8]">PleaseBeReady</span>
            <span style={{ color: A }}>.com</span>
          </div>
          <a href="#start" style={{ background: A, color: "#0C0C0C" }} className="rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.15em] hover:opacity-90 transition">
            Start Here
          </a>
        </div>

        {/* Hero */}
        <section className="mb-14 text-center">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.3em]" style={{ color: A }}>
            Preparedness, minus the panic
          </p>
          <h1 className="mb-5 text-4xl font-black leading-tight text-[#F5F0E8] sm:text-6xl">
            Please Be Ready.
          </h1>
          <p className="mx-auto mb-4 max-w-xl text-lg font-semibold leading-8 text-[#F5F0E8]">
            A calm, friendly guide to getting your household ready — one small step at a time.
          </p>
          <p className="mx-auto max-w-lg text-sm font-semibold leading-7 text-[#9A9188]">
            No bunkers. No doomsday. No fear. Just practical, everyday readiness for the things that actually happen — a storm, an outage, a sick week, a job loss. You&apos;ve got this.
          </p>
        </section>

        {/* Ethos */}
        <section className="mb-14 rounded-3xl border border-[#262626] bg-[#151515] p-7 text-center">
          <p className="text-base font-semibold leading-8 text-[#F5F0E8]">
            You don&apos;t need to prepare for the end of the world. You just need to be ready for the
            <strong className="text-white"> stuff that actually happens.</strong> Start small. Build slowly.
            Being ready isn&apos;t about fear — it&apos;s about <strong className="text-white">peace of mind</strong> and
            being able to help the people around you.
          </p>
        </section>

        {/* Start Here */}
        <section id="start" className="mb-16 scroll-mt-6">
          <h2 className="mb-2 text-2xl font-black text-[#F5F0E8]">Your First Weekend</h2>
          <p className="mb-6 text-sm font-semibold text-[#9A9188]">Five small wins. Do them this weekend and you&apos;re already ahead of most people.</p>
          <div className="flex flex-col gap-3">
            {startHere.map((s) => (
              <div key={s.n} className="flex gap-4 rounded-2xl border border-[#262626] bg-[#151515] p-5">
                <span style={{ background: A, color: "#0C0C0C" }} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base font-black">{s.n}</span>
                <div>
                  <h3 className="text-base font-black text-[#F5F0E8]">{s.title}</h3>
                  <p className="mt-1 text-sm font-semibold leading-6 text-[#9A9188]">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* The 10 areas */}
        <section className="mb-16">
          <h2 className="mb-2 text-2xl font-black text-[#F5F0E8]">The 10 Readiness Areas</h2>
          <p className="mb-6 text-sm font-semibold text-[#9A9188]">You don&apos;t have to tackle these all at once. Pick one, check it off, come back next month.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {areas.map((a) => (
              <div key={a.title} className="rounded-2xl border border-[#262626] bg-[#151515] p-6">
                <div className="mb-3 text-3xl">{a.emoji}</div>
                <h3 className="text-lg font-black text-[#F5F0E8]">{a.title}</h3>
                <p className="mt-1 mb-4 text-sm font-semibold leading-6 text-[#9A9188]">{a.intro}</p>
                <ul className="flex flex-col gap-2">
                  {a.items.map((it) => (
                    <li key={it} className="flex gap-2 text-sm font-semibold text-[#F5F0E8]">
                      <span style={{ color: A }}>✓</span>
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Levels */}
        <section className="mb-16">
          <h2 className="mb-2 text-2xl font-black text-[#F5F0E8]">Pick Your Level</h2>
          <p className="mb-6 text-sm font-semibold text-[#9A9188]">Start where you are. Move up only when you&apos;re ready. Every level is a real win.</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {levels.map((l) => (
              <div key={l.title} className="rounded-2xl border border-[#262626] bg-[#151515] p-6">
                <p className="text-xs font-black uppercase tracking-[0.15em]" style={{ color: A }}>{l.tag}</p>
                <h3 className="mt-1 text-xl font-black text-[#F5F0E8]">{l.title}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#9A9188]">{l.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Resources */}
        <section className="mb-14 rounded-3xl border border-[#262626] bg-[#151515] p-7">
          <h2 className="mb-2 text-xl font-black text-[#F5F0E8]">Trusted, Free Resources</h2>
          <p className="mb-5 text-sm font-semibold text-[#9A9188]">When you want to go deeper, these are the real, official sources.</p>
          <div className="flex flex-col gap-2">
            {resources.map((r) => (
              <a key={r.href} href={r.href} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-[#262626] bg-[#1C1C1C] px-5 py-3.5 text-sm font-black text-[#F5F0E8] hover:border-[#3a3a3a] transition">
                <span>{r.label}</span>
                <span style={{ color: A }}>→</span>
              </a>
            ))}
          </div>
        </section>

        {/* Closing */}
        <section className="mb-12 text-center">
          <p className="mx-auto max-w-lg text-lg font-black leading-8 text-[#F5F0E8]">
            Being ready is a gift you give your family — and your neighbors.
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm font-semibold text-[#9A9188]">
            Start with one thing today. That&apos;s all it takes to begin.
          </p>
        </section>

        {/* Disclaimer + footer */}
        <footer className="border-t border-[#262626] pt-8 text-center">
          <p className="mx-auto mb-5 max-w-xl text-xs font-semibold leading-6 text-[#9A9188]">
            PleaseBeReady.com shares general preparedness information to help you get started. It is not
            professional, medical, or emergency advice. In any real emergency, call your local emergency
            number and follow official guidance from authorities like Ready.gov and the Red Cross.
          </p>
          <p className="text-sm font-black tracking-tight">
            <span className="text-[#F5F0E8]">PleaseBeReady</span>
            <span style={{ color: A }}>.com</span>
          </p>
        </footer>

      </div>
    </main>
  );
}
