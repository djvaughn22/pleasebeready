"use client";

// One product card, the same everywhere: the exact product we picked (brand
// and model, why, what it suits) or the plain item with its Amazon search,
// the amount on kit pages, Shop and Save buttons, and other good choices.
// No product images: Amazon only allows them through its API, which this site
// doesn't use yet. Tasks never get a card.

import { memo } from "react";
import { amazonUrl } from "../../lib/gear";
import { checkedOn, picksFor, roleText } from "../../lib/shop/picks";
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

export const dateText = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

const tag = "rounded-md border px-1.5 py-0.5 text-[0.65rem] font-black uppercase tracking-wider";

function ItemCard({ item, s, compact }: { item: CatalogItem; s?: Suggestion; compact?: boolean }) {
  const saver = useSaver();
  const saved = saver.has(item.id);
  const [main, ...others] = picksFor(item.id);
  const rule = s ? null : ruleText(item);
  const varies = item.rule.per === "varies";
  return (
    <li className={`flex flex-col gap-3 rounded-2xl border bg-[#141d2e] ${compact ? "p-3.5" : "p-4"} ${saved ? "border-[#34D399]" : "border-[#26324c]"}`}>
      <div className="flex items-start gap-3">
        <span aria-hidden className="mt-0.5 text-2xl leading-none">{categoryById(item.cat).emoji}</span>
        <div className="min-w-0 flex-1">
          {(item.pri === "essential" || main || item.pro) && (
            <div className="mb-1 flex flex-wrap gap-1.5">
              {item.pri === "essential" && <span className={`${tag} border-[#34D399] pbr-accent`}>Must-have</span>}
              {main && <span className={`${tag} border-[#26324c] pbr-blue`}>{roleText[main.role]}</span>}
              {item.pro && <span className={`${tag} border-[#26324c] pbr-amber`}>Check with a pro</span>}
            </div>
          )}
          {main ? (
            <>
              <p className="text-xs font-bold text-[#94a3b8]">{item.name}</p>
              <h3 className="text-base font-black leading-snug text-[#e8edf5]">{main.name}</h3>
              <p className="mt-1 text-sm font-semibold leading-6 pbr-body">{main.why}</p>
              <p className={muted}>Good for: {main.use}</p>
            </>
          ) : (
            <>
              <h3 className="text-base font-black leading-snug text-[#e8edf5]">{item.name}</h3>
              {item.note && <p className="mt-1 text-sm font-semibold leading-6 pbr-body">{item.note}</p>}
            </>
          )}
          {s && (
            <p className="mt-1.5 text-sm font-bold tabular-nums text-[#e8edf5]">
              {varies ? "Amount varies" : <>Get about {s.qty.toLocaleString("en-US")} {unitWord(item, s.qty)}</>}
              {s.packs !== null && item.pack! > 1 && !varies && <span className="text-[#94a3b8]"> ({s.packs} × {item.pack}-pack)</span>}
            </p>
          )}
          {s && !varies && !compact && <p className={muted}>{s.how}{item.source ? " · official amount" : ""}</p>}
          {rule && !compact && <p className={muted}>{rule}</p>}
          {main && item.note && !compact && <p className={`mt-1 ${muted}`}>{item.note}</p>}
          {!main && item.q && item.q.toLowerCase() !== item.name.toLowerCase() && (
            <p className={`mt-1 ${muted}`}>Amazon search: “{item.q}”</p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <ShopButton item={item} big />
        <button type="button" disabled={!saver.ready} onClick={() => saver.toggle(item.id)} aria-pressed={saved}
          aria-label={saved ? `Remove ${item.name} from your Ready List` : `Save ${item.name} to your Ready List`}
          className={`${btnSmall} min-h-11 min-w-[5.5rem] shrink-0 ${saved ? "pbr-accent" : ""}`}>
          {saved ? "✓ Saved" : "☆ Save"}
        </button>
      </div>
      {!compact && others.length > 0 && (
        <ul aria-label={`Other choices for ${item.name}`} className="flex flex-col gap-2 border-t border-[#26324c] pt-2.5">
          {others.map((o) => (
            <li key={o.asin} className="text-xs leading-5">
              <a href={amazonUrl(o.asin)} target="_blank" rel="noopener noreferrer sponsored"
                data-measure="shop" data-measure-label={`${item.cat}-${o.role}-${item.id}`}
                aria-label={`${roleText[o.role]}: ${o.name} on Amazon (opens in a new tab)`}
                className="font-black text-[#e8edf5] underline decoration-[#34D399] underline-offset-2 hover:brightness-110">
                <span className="pbr-blue">{roleText[o.role]}:</span> {o.name} ↗
              </a>
              <span className="block font-semibold text-[#94a3b8]">{o.why}</span>
            </li>
          ))}
        </ul>
      )}
      {main && !compact && <p className="-mt-1 text-[0.7rem] font-semibold text-[#94a3b8]">Product link checked {dateText(checkedOn(main))}</p>}
    </li>
  );
}

export default memo(ItemCard);
