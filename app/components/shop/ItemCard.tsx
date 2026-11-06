"use client";

// One product card, the same everywhere: the exact product we picked (brand
// and model, why, what it suits) or the plain item with its Amazon search,
// the amount on kit pages, Shop and Save buttons, and other good choices.
// No product photos: Amazon only allows them through its API, which this site
// doesn't use yet, so the card shows a drawing of the kind of product (Art.tsx).
// Tasks never get a card.

import { memo } from "react";
import { amazonUrl } from "../../lib/gear";
import { lanesFor } from "../../lib/shop/lanes";
import { checkedOn, picksFor, roleText } from "../../lib/shop/picks";
import { foodMix, waterOptions } from "../../lib/ready/supplies";
import { itemById } from "../../lib/stockup/catalog";
import { unitWord } from "../../lib/stockup/calc";
import { packsText } from "../../lib/stockup/shop";
import type { CatalogItem, Per, Suggestion } from "../../lib/stockup/types";
import BackupLink from "../stockup/BackupLink";
import ShopButton from "../stockup/ShopButton";
import { btnSmall, muted } from "../stockup/ui";
import { ProductArt } from "./Art";
import { useSaver } from "./Saver";
import { earnedBadge, tint } from "./Store";

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

/** `minor`: a convenience item on this page (party cups in Emergency), so no Must-have badge. */
function ItemCard({ item, s, compact, minor }: { item: CatalogItem; s?: Suggestion; compact?: boolean; minor?: boolean }) {
  const saver = useSaver();
  const saved = saver.has(item.id);
  const [main, ...others] = picksFor(item.id);
  const rule = s ? null : ruleText(item);
  const varies = item.rule.per === "varies";
  const must = item.pri === "essential" && !minor;
  const badge = main ? earnedBadge(main) : null;
  const color = lanesFor(item)[0]?.color ?? "#F97316";
  return (
    <li className={`flex flex-col gap-3 rounded-2xl border bg-[#141d2e] ${compact ? "p-3.5" : "p-4"} ${saved ? "border-[#F97316]" : "border-[#26324c]"}`}>
      <div className="flex items-start gap-3">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl" style={tint(color)}>
          <ProductArt id={item.id} cat={item.cat} color={color} size={44} />
        </span>
        <div className="min-w-0 flex-1">
          {(must || badge || item.pro) && (
            <div className="mb-1 flex flex-wrap gap-1.5">
              {must && <span className={`${tag} border-[#F97316] pbr-accent`}>Must-have</span>}
              {badge && <span className={`${tag} border-[#26324c] pbr-blue`}>{badge}</span>}
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
              {/* The catalog's pack size is a typical one; an exact product's own count gives the real package math. */}
              {s.packs !== null && item.pack! > 1 && !varies && !main && <span className="text-[#94a3b8]"> ({s.packs} × {item.pack}-pack)</span>}
              {!varies && packsText(item, s.qty) && <span className="text-[#94a3b8]"> ({packsText(item, s.qty)})</span>}
            </p>
          )}
          {s && !varies && !compact && <p className={muted}>{s.how}{item.source ? " · official amount" : ""}</p>}
          {s && !compact && <SupplyHint id={item.id} qty={s.qty} />}
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
      <BackupLink item={item} short={compact} />
      {!compact && others.length > 0 && (
        <ul aria-label={`Other choices for ${item.name}`} className="flex flex-col gap-2 border-t border-[#26324c] pt-2.5 print:hidden">
          {others.map((o) => (
            <li key={o.asin} className="text-xs leading-5">
              <a href={amazonUrl(o.asin)} target="_blank" rel="noopener noreferrer sponsored"
                data-measure="shop" data-measure-label={`${item.cat}-${o.role}-${item.id}`}
                aria-label={`${roleText[o.role]}: ${o.name} on Amazon (opens in a new tab)`}
                className="font-black text-[#e8edf5] underline decoration-[#F97316] underline-offset-2 hover:brightness-110">
                <span className="pbr-blue">{roleText[o.role]}:</span> {o.name} ↗
              </a>
              <span className="block font-semibold text-[#94a3b8]">{o.why}</span>
            </li>
          ))}
        </ul>
      )}
      {main && !compact && <p className="-mt-1 text-[0.7rem] font-semibold text-[#94a3b8]">Listing checked {dateText(checkedOn(main))}. Amazon shows today’s price and stock.</p>}
    </li>
  );
}

export default memo(ItemCard);

/** Water and food as practical buys (lib/ready/supplies.ts): cases, jugs or containers; a grocery mix. */
function SupplyHint({ id, qty }: { id: string; qty: number }) {
  const n = (x: number) => x.toLocaleString("en-US");
  if (id === "water") {
    const o = waterOptions(qty);
    return <p className="text-xs font-bold pbr-accent">= {n(o.cases)} cases of 24 bottles, {n(o.jugs)} gallon jugs, or {n(o.containers)} seven-gallon containers you fill</p>;
  }
  if (id === "shelf-food") {
    const mix = foodMix(qty).slice(0, 4).map((m) => `${n(m.qty)} ${m.qty === 1 ? itemById(m.id)!.unit.one : itemById(m.id)!.unit.many} (${m.group.toLowerCase()})`);
    return <p className="text-xs font-bold pbr-accent">A mix like {mix.join(", ")} and more</p>;
  }
  return null;
}
