"use client";

// Storefront pieces: product tiles (one exact product each, with Save and Shop
// on Amazon), and a budget-to-upgrade comparison for items that have more than
// one exact product. The art is a drawing of the kind of product (Art.tsx) in
// its lane's color: Amazon allows product photos only through its API, which
// the site doesn't use yet.

import { useState } from "react";
import { amazonUrl } from "../../lib/gear";
import { lanesFor } from "../../lib/shop/lanes";
import { picksFor, roleText, type Pick, type Role } from "../../lib/shop/picks";
import { itemById } from "../../lib/stockup/catalog";
import ShopButton from "../stockup/ShopButton";
import { ProductArt } from "./Art";
import { useSaver } from "./Saver";

// Product art sits on a plain panel, like a product photo; the drawing carries the lane color.
// (A lane-color tint turned brown under orange.) `share` keeps a hint of the color where wanted.
export const tint = (color: string, share = 0) => ({ background: share ? `color-mix(in srgb, ${color} ${share}%, var(--om-surface-2))` : "var(--om-surface-2)" });
const badgeCss = "rounded-md bg-[#0b1220] px-1.5 py-0.5 text-[0.62rem] font-black uppercase tracking-wider text-[#e8edf5]";

/** The badge a product earns: its role when it was chosen against others, never "Our pick" on a lone product. */
export function earnedBadge(p: Pick): string | null {
  if (p.role !== "pick") return roleText[p.role];
  return picksFor(p.item).length > 1 ? roleText.pick : null;
}

export function SaveStar({ id, name, className = "absolute right-2 top-2" }: { id: string; name: string; className?: string }) {
  const saver = useSaver();
  const saved = saver.has(id);
  return (
    <button type="button" disabled={!saver.ready} onClick={() => saver.toggle(id)} aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from your Ready List` : `Save ${name} to your Ready List`}
      title={saved ? "Saved" : "Save to your Ready List"}
      className={`${className} flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-xl font-black ${saved ? "pbr-edge bg-[#F97316] text-[#0b1220]" : "border-[#26324c] bg-[#141d2e] text-[#e8edf5]"}`}>
      <span aria-hidden>{saved ? "★" : "☆"}</span>
    </button>
  );
}

/** One exact product as a store tile. `tag` shows when the product has no earned badge (e.g. "New", "Must-have"). */
export function ProductTile({ pick, tag }: { pick: Pick; tag?: string }) {
  const item = itemById(pick.item);
  if (!item) return null;
  const color = lanesFor(item)[0]?.color ?? "#F97316";
  const badge = earnedBadge(pick) ?? tag;
  // Budget picks and upgrades link to their own ASIN; an item's main pick goes through ShopButton.
  const own = picksFor(item.id)[0]?.asin !== pick.asin;
  return (
    <li className="flex flex-col overflow-hidden rounded-2xl border border-[#26324c] bg-[#141d2e]">
      <div className="relative flex aspect-[3/2] items-center justify-center" style={tint(color)}>
        <ProductArt id={item.id} cat={item.cat} color={color} size={96} />
        {badge && <span className={`absolute left-2 top-2 ${badgeCss}`}>{badge}</span>}
        <SaveStar id={item.id} name={item.name} />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="truncate text-[0.68rem] font-black uppercase tracking-wider text-[#94a3b8]">{item.name}</p>
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-black leading-5 text-[#e8edf5]">{pick.name}</h3>
        <p className="line-clamp-2 min-h-[2.5rem] text-xs font-semibold leading-5 text-[#94a3b8]">{pick.why}</p>
        <div className="mt-auto pt-2">
          {own ? (
            <a href={amazonUrl(pick.asin)} target="_blank" rel="noopener noreferrer sponsored"
              data-measure="shop" data-measure-label={`${item.cat}-${pick.role}-${item.id}`}
              aria-label={`Shop on Amazon: ${pick.name} (product page, opens in a new tab)`}
              className="pbr-edge inline-flex min-h-10 w-full items-center justify-center whitespace-nowrap rounded-lg border-2 bg-[#F97316] px-2 text-[0.8rem] font-black text-[#0b1220] transition hover:brightness-110">
              Shop on Amazon
            </a>
          ) : <ShopButton item={item} tile />}
        </div>
      </div>
    </li>
  );
}

const ORDER: Role[] = ["value", "pick", "alt", "upgrade"];

/** Every exact product for one item, cheapest role first. */
export function CompareCard({ id }: { id: string }) {
  const item = itemById(id);
  if (!item) return null;
  const options = [...picksFor(id)].sort((a, b) => ORDER.indexOf(a.role) - ORDER.indexOf(b.role));
  const color = lanesFor(item)[0]?.color ?? "#F97316";
  return (
    <li className="overflow-hidden rounded-2xl border border-[#26324c] bg-[#141d2e]">
      <div className="flex items-center gap-3 px-4 py-2.5" style={tint(color)}>
        <ProductArt id={item.id} cat={item.cat} color={color} size={44} />
        <h3 className="pbr-display min-w-0 flex-1 text-base font-black text-[#e8edf5]">{item.name}</h3>
        <SaveStar id={id} name={item.name} className="" />
      </div>
      <ul className="divide-y divide-[var(--om-border)]">
        {options.map((o) => (
          <li key={o.asin}>
            <a href={amazonUrl(o.asin)} target="_blank" rel="noopener noreferrer sponsored"
              data-measure="shop" data-measure-label={`${item.cat}-${o.role}-${item.id}`}
              aria-label={`${roleText[o.role]}: ${o.name} on Amazon (opens in a new tab)`}
              className="pbr-row flex min-h-14 items-center gap-3 px-4 py-2.5">
              <span className={`w-[5.5rem] shrink-0 text-[0.68rem] font-black uppercase tracking-wider ${o.role === "pick" ? "pbr-accent" : "pbr-blue"}`}>{roleText[o.role]}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black leading-snug text-[#e8edf5]">{o.name}</span>
                <span className="block truncate text-xs font-semibold text-[#94a3b8]">{o.why}</span>
              </span>
              <span aria-hidden className="pbr-accent text-sm font-black">↗</span>
            </a>
          </li>
        ))}
      </ul>
    </li>
  );
}

export type FindsTab = { key: string; label: string; picks: Pick[]; tag?: string };

/** Ready Finds: tabs of product tiles (New, Everyday, Budget picks, Upgrades, Verified deals). */
export function FindsTabs({ tabs }: { tabs: FindsTab[] }) {
  const live = tabs.filter((t) => t.picks.length);
  const [on, setOn] = useState(live[0]?.key);
  const tab = live.find((t) => t.key === on) ?? live[0];
  if (!tab) return null;
  return (
    <>
      <div role="tablist" aria-label="Ready Finds" className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {live.map((t) => (
          <button key={t.key} type="button" role="tab" id={`finds-tab-${t.key}`} aria-selected={t.key === tab.key} aria-controls="finds-panel"
            onClick={() => setOn(t.key)}
            className={`min-h-10 shrink-0 whitespace-nowrap rounded-full border px-4 text-sm font-black ${t.key === tab.key ? "pbr-edge bg-[#F97316] text-[#0b1220]" : "border-[#26324c] text-[#e8edf5]"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <ul id="finds-panel" role="tabpanel" aria-labelledby={`finds-tab-${tab.key}`} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {tab.picks.map((p) => <ProductTile key={p.asin} pick={p} tag={tab.tag} />)}
      </ul>
    </>
  );
}
