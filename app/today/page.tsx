// Permanent Instagram bio link: pleasebeready.com/today — always shows the
// current Daily Readiness Check. Deterministic, so it never breaks and
// always matches the day's Instagram post.

import type { Metadata } from "next";
import { buildDailyReadiness } from "../lib/dailyReadiness";
import { chicagoDateKey } from "../lib/dailySocialCore";
import { amazonUrl } from "../lib/gear";

export const dynamic = "force-dynamic";

const A = "#34D399";

export async function generateMetadata(): Promise<Metadata> {
  const { task, post } = buildDailyReadiness(chicagoDateKey());
  return {
    title: `Daily Readiness Check — ${task.title}`,
    description: `${task.detail} ${post.fullDate}.`,
  };
}

export default function TodayPage() {
  const dateKey = chicagoDateKey();
  const { task, post } = buildDailyReadiness(dateKey);

  return (
    <main className="min-h-screen bg-[#0b1220] text-[#e8edf5]">
      <div className="mx-auto max-w-2xl px-5 py-12">
        <header className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.24em]" style={{ color: A }}>
            Daily Readiness Check
          </p>
          <h1 className="mt-2 text-2xl font-black sm:text-3xl">{post.fullDate}</h1>
          <p className="mx-auto mt-3 max-w-md text-sm font-semibold leading-6 text-[#94a3b8]">
            One small preparedness task a day. Small steps, ready family.
          </p>
        </header>

        <section className="pop mt-8 rounded-3xl border border-[#26324c] bg-[#141d2e] p-7">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{task.emoji}</span>
            <p className="text-xs font-black uppercase tracking-[0.15em]" style={{ color: A }}>
              {task.area}
            </p>
          </div>
          <h2 className="mt-4 text-2xl font-black leading-tight sm:text-3xl">{task.title}</h2>
          <p className="mt-4 text-base font-semibold leading-7 text-[#94a3b8]">{task.detail}</p>

          {task.gear ? (
            <a
              href={amazonUrl(task.gear.asin)}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="mt-6 inline-flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-black transition hover:opacity-90"
              style={{ background: A, color: "#0b1220" }}
            >
              <span>🛒 {task.gear.name}</span>
              <span>→</span>
            </a>
          ) : null}
        </section>

        <div className="mt-8 flex flex-col items-center gap-3 text-center">
          <a href="/" className="font-black" style={{ color: A }}>
            See the full checklists and all the gear →
          </a>
          <p className="max-w-md text-xs font-semibold leading-5 text-[#94a3b8]">
            A new task appears every day at midnight Central Time. This page
            always matches the day&apos;s Instagram post.
          </p>
          <p className="max-w-md text-xs font-semibold leading-5 text-[#94a3b8]">
            As an Amazon Associate, PleaseBeReady earns from qualifying purchases.
          </p>
        </div>
      </div>
    </main>
  );
}
