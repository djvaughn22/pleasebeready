"use client";

// One product: what it is, how much (on kit pages), our checked product when
// we have one, an Amazon button and a Save button. Tasks never get a card.

import { memo } from "react";
import { pickForItem, tierText } from "../../lib/shop/picks";
import { unitWord } from "../../lib/stockup/calc";
import { categoryById } from "../../lib/stockup/catalog";
import type { CatalogItem, Per, Suggestion } from "../../lib/stockup/types";
import ShopButton from "../stockup/ShopButton";
import { btnSmall, muted } from "../stockup/ui";
import { useSaver } from "./Saver";

const perText: Partial<Record<Per, string>> = {
  group: "for the group", person: "each", adult: "per adult", kid: "per kid", baby: "per baby", pet: "per pet",
  personDay: "per person per day", kidDay: "per kid per day", babyDay: "per baby per day", petDay: "per pet per day",
  personNight: "per person per night", personMeal: "per person per meal",
};

/** "1 gallon per person per day": the planning rule, when it reads cleanly. */
export function ruleText(item: CatalogItem): string | null {
  const { per, n } = item.rule;
  if (per === "varies") return "Amount varies";
  const tail = perText[per];
  if (!tail || n < 1) return null;
  return `${n.toLocaleString("en-US")} ${n === 1 ? item.unit.one : item.unit.many} ${tail}`;
}

const dateText = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

const tag = "rounded-md border px-1.5 py-0.5 text-[0.65rem] font-black uppercase tracking-wider";

function ItemCard({ item, s }: { item: CatalogItem; s?: Suggestion }) {
  const saver = useSaver();
  const saved = saver.has(item.id);
  const pick = pickForItem(item.id);
  const rule = s ? null : ruleText(item);
  const varies = item.rule.per === "varies";
  return (
    <li className={`flex flex-col gap-3 rounded-2xl border bg-[#141d2e] p-4 ${saved ? "border-[#34D399]" : "border-[#26324c]"}`}>
      <div className="flex items-start gap-3">
        <span aria-hidden className="mt-0.5 text-2xl leading-none">{categoryById(item.cat).emoji}</span>
        <div className="min-w-0 flex-1">
          {(item.pri === "essential" || pick || item.pro) && (
            <div className="mb-1 flex flex-wrap gap-1.5">
              {item.pri === "essential" && <span className={`${tag} border-[#34D399] pbr-accent`}>Must-have</span>}
              {pick && <span className={`${tag} border-[#26324c] pbr-blue`}>Our pick · {tierText[pick.tier]}</span>}
              {item.pro && <span className={`${tag} border-[#26324c] pbr-amber`}>Check with a pro</span>}
            </div>
          )}
          <h3 className="text-base font-black leading-snug text-[#e8edf5]">{item.name}</h3>
          {pick && <p className="mt-0.5 text-sm font-bold leading-snug text-[#e8edf5]">{pick.name}</p>}
          {s && (
            <p className="mt-1 text-sm font-bold tabular-nums text-[#e8edf5]">
              {varies ? "Amount varies" : <>Get about {s.qty.toLocaleString("en-US")} {unitWord(item, s.qty)}</>}
              {s.packs !== null && item.pack! > 1 && !varies && <span className="text-[#94a3b8]"> ({s.packs} × {item.pack}-pack)</span>}
            </p>
          )}
          {s && !varies && <p className={muted}>{s.how}{item.source ? " · official amount" : ""}</p>}
          {rule && <p className={muted}>{rule}</p>}
          {(pick?.why ?? item.note) && <p className={`mt-1 ${muted}`}>{pick?.why ?? item.note}</p>}
          {pick?.checked && <p className={`mt-1 ${muted}`}>Product link checked {dateText(pick.checked)}</p>}
          {!pick && item.q && item.q.toLowerCase() !== item.name.toLowerCase() && <p className={`mt-1 ${muted}`}>Amazon search: “{item.q}”</p>}
        </div>
      </div>
      <div className="flex gap-2">
        <ShopButton item={item} big />
        <button type="button" disabled={!saver.ready} onClick={() => saver.toggle(item.id)} aria-pressed={saved}
          aria-label={saved ? `Remove ${item.name} from your list` : `Save ${item.name} to your list`}
          className={`${btnSmall} min-h-11 min-w-[5.5rem] shrink-0 ${saved ? "pbr-accent" : ""}`}>
          {saved ? "✓ Saved" : "☆ Save"}
        </button>
      </div>
    </li>
  );
}

export default memo(ItemCard);
