"use client";

// A kit page's shopping part: the group's numbers, every amount worked out
// from them, Save for the whole kit or one item, and an Amazon button per item.
// Numbers can arrive in the link (?people=6&days=5) from a search.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { kitNumbers, kitPlan, kitRows, numbersFromQuery, type KitNumbers } from "../../lib/shop/kitPlan";
import { kitBySlug, type Kit } from "../../lib/shop/kits";
import { MAX_DAYS, MAX_PEOPLE, durationLabel } from "../../lib/stockup/calc";
import { itemById } from "../../lib/stockup/catalog";
import { GoodToKnow, Stepper, btnPrimary, btnSmall, inset, muted } from "../stockup/ui";
import ItemCard from "./ItemCard";
import ListsProvider, { useLists } from "./ListsProvider";
import SaveBar from "./SaveBar";
import Saver, { useSaver } from "./Saver";

const grid = "grid gap-3 sm:grid-cols-2";

export default function KitView({ slug }: { slug: string }) {
  const kit = kitBySlug(slug)!;
  const [n, setN] = useState<KitNumbers>(() => kitNumbers(kit));

  // Numbers from a search link. Read after the first render so the page can be built ahead of time.
  useEffect(() => {
    if (!window.location.search) return;
    const t = setTimeout(() => setN((cur) => numbersFromQuery(window.location.search, cur)), 0);
    return () => clearTimeout(t);
  }, []);

  return (
    <ListsProvider>
      <Saver kit={kit} numbers={n}>
        <KitBody kit={kit} n={n} setN={setN} />
        <SaveBar />
      </Saver>
    </ListsProvider>
  );
}

function KitBody({ kit, n, setN }: { kit: Kit; n: KitNumbers; setN: (fn: (n: KitNumbers) => KitNumbers) => void }) {
  const api = useLists();
  const saver = useSaver();
  const plan = useMemo(() => kitPlan(kit, n), [kit, n]);
  const rows = (ids: string[] = []) => kitRows(ids, plan);
  const mine = api.kitList(kit.slug);
  const forget = kit.forget ?? [];
  const todo = kit.todo ?? [];
  const saveSet = [...kit.essentials, ...forget, ...todo];
  const missing = mine ? saveSet.filter((id) => !mine.list[id]) : saveSet;
  const set = (patch: Partial<KitNumbers>) => setN((cur) => {
    const next = { ...cur, ...patch };
    next.people = Math.max(next.people, next.kids + next.babies);
    return next;
  });

  const who = [`${n.people} ${n.people === 1 ? "person" : "people"}`];
  if (n.kids) who.push(`${n.kids} ${n.kids === 1 ? "kid" : "kids"}`);
  if (n.pets) who.push(`${n.pets} ${n.pets === 1 ? "pet" : "pets"}`);

  return (
    <div className="pbr-planner flex flex-col gap-10">
      <section aria-label="Your group and how long" className={`${inset} flex flex-col gap-4 p-4`}>
        {kit.ask.length > 0 && (
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {kit.ask.includes("people") && <Stepper compact id="kit-people" text="People" value={n.people} min={1} max={MAX_PEOPLE} onChange={(v) => set({ people: v, kids: Math.max(0, Math.min(n.kids, v - n.babies)) })} />}
            {kit.ask.includes("kids") && <Stepper compact id="kit-kids" text="Kids" value={n.kids} min={0} max={MAX_PEOPLE} onChange={(v) => set({ kids: v })} />}
            {kit.ask.includes("pets") && <Stepper compact id="kit-pets" text="Pets" value={n.pets} min={0} max={50} onChange={(v) => set({ pets: v })} />}
            {kit.ask.includes("days") && <Stepper compact id="kit-days" text="Days" value={n.days} min={1} max={MAX_DAYS} onChange={(v) => set({ days: v })} />}
          </div>
        )}
        <p className={muted}>
          Amounts below are for {who.join(", ")}{kit.ask.includes("days") ? `, ${durationLabel(n.days)}` : ""}. They are planning estimates; change any of them on your list.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={btnPrimary} disabled={!saver.ready || missing.length === 0} onClick={() => saver.saveMany(missing)}>
            {mine ? (missing.length ? `⭐ Add the ${missing.length} missing to your list` : "✓ Kit saved") : "⭐ Save this kit"}
          </button>
          {mine && <Link href={`/lists#list=${mine.id}`} className={btnSmall}>Open your list ({Object.keys(mine.list).length})</Link>}
        </div>
        <p className={muted}>
          Saves the {kit.essentials.length} must-haves{forget.length ? `, ${forget.length} easy-to-forget items` : ""}{todo.length ? ` and ${todo.length} things to do` : ""} to a list on this device. Upgrades are up to you. Then shop the list item by item and tick things off.
        </p>
      </section>

      <GoodToKnow> “Buy on Amazon” opens a product we checked; “Find on Amazon” opens search results. Each button opens one item; there is no combined cart.</GoodToKnow>

      <Section id="must" title="Must-haves" count={kit.essentials.length}>
        <ul className={grid}>{rows(kit.essentials).map((s) => <ItemCard key={s.item.id} item={s.item} s={s} />)}</ul>
      </Section>

      {forget.length > 0 && (
        <Section id="forget" title="Easy to forget" count={forget.length}>
          <ul className={grid}>{rows(forget).map((s) => <ItemCard key={s.item.id} item={s.item} s={s} />)}</ul>
        </Section>
      )}

      {kit.upgrades.length > 0 && (
        <Section id="upgrades" title="Upgrades" count={kit.upgrades.length}
          action={<button type="button" className={btnSmall} disabled={!saver.ready || kit.upgrades.every((id) => saver.has(id))} onClick={() => saver.saveMany(kit.upgrades.filter((id) => !saver.has(id)))}>
            {kit.upgrades.every((id) => saver.has(id)) ? "✓ All saved" : "Save all upgrades"}
          </button>}>
          <ul className={grid}>{rows(kit.upgrades).map((s) => <ItemCard key={s.item.id} item={s.item} s={s} />)}</ul>
        </Section>
      )}

      {kit.budget && kit.budget.length > 0 && (
        <Section id="budget" title="Spend less" count={kit.budget.length}>
          <div className={grid}>
            {kit.budget.map((b) => {
              const [s] = rows([b.id]);
              return (
                <div key={b.id} className="flex flex-col gap-1.5">
                  <p className={muted}>Instead of {itemById(b.instead)?.name.toLowerCase()}:</p>
                  <ul className="flex flex-col">{s && <ItemCard item={s.item} s={s} />}</ul>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {todo.length > 0 && (
        <Section id="todo" title="Things to do" count={todo.length}>
          <ul className="flex flex-col gap-2">
            {todo.map((id) => {
              const t = itemById(id)!;
              const on = saver.has(id);
              return (
                <li key={id} className={`${inset} flex items-start justify-between gap-3 p-3`}>
                  <span className="min-w-0">
                    <span className="block text-sm font-black text-[#e8edf5]">✅ {t.name}</span>
                    {t.note && <span className={`block ${muted}`}>{t.note}</span>}
                  </span>
                  <button type="button" className={`${btnSmall} shrink-0 ${on ? "pbr-accent" : ""}`} disabled={!saver.ready} aria-pressed={on}
                    onClick={() => saver.toggle(id)} aria-label={on ? `Remove ${t.name} from your list` : `Save ${t.name} to your list`}>
                    {on ? "✓ Saved" : "☆ Save"}
                  </button>
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      {kit.guide && (
        <p className="text-sm font-bold text-[#e8edf5]">
          Official guide:{" "}
          <a href={kit.guide.href} target="_blank" rel="noopener noreferrer" data-measure="guide" data-measure-label={kit.slug} className="font-black underline pbr-accent">
            {kit.guide.label} ↗
          </a>
        </p>
      )}
    </div>
  );
}

function Section({ id, title, count, action, children }: { id: string; title: string; count: number; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`kit-${id}`}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 id={`kit-${id}`} className="text-xl font-black">{title} <span className="text-sm text-[#94a3b8]">({count})</span></h2>
        {action}
      </div>
      {children}
    </section>
  );
}
