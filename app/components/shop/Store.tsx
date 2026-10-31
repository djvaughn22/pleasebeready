"use client";

// Storefront pieces for the home page: product tiles (one exact product each,
// with Save and Shop on Amazon), and a budget-to-upgrade comparison for items
// that have more than one exact product. The art panel is the item's category
// in its lane's color: Amazon allows product photos only through its API,
// which the site doesn't use yet.

import { amazonUrl } from "../../lib/gear";
import { lanesFor } from "../../lib/shop/lanes";
import { picksFor, primaryPick, roleText, type Role } from "../../lib/shop/picks";
import { categoryById, itemById } from "../../lib/stockup/catalog";
import type { CatalogItem } from "../../lib/stockup/types";
import ShopButton from "../stockup/ShopButton";
import { useSaver } from "./Saver";

// Art for the items the home page features; anything else shows its category's emoji.
const ART: Record<string, string> = {
  "portable-jump-starter": "⚡", headlamps: "🔆", "dash-camera": "📹", "rechargeable-lantern": "🏮",
  "motion-sensor-night-lights": "💡", "cordless-drill": "🪛", "reusable-water-bottles": "🥤", "pet-first-aid-kit": "🐾",
  flashlights: "🔦", batteries: "🔋", "weather-radio": "📻", "power-bank": "🔌", "first-aid-kit": "🩹",
  "water-storage-container": "💧", "smoke-and-co-alarm": "🚨", "fire-extinguisher": "🧯",
  "portable-power-station": "🔋", "personal-water-filter": "💧",
};
const art = (id: string, cat: CatalogItem["cat"]) => ART[id] ?? categoryById(cat).emoji;

const tint = (color: string, share = 22) => ({ background: `color-mix(in srgb, ${color} ${share}%, var(--om-surface))` });
const badge = "rounded-md bg-[#0b1220] px-1.5 py-0.5 text-[0.62rem] font-black uppercase tracking-wider text-[#e8edf5]";

function SaveStar({ id, name }: { id: string; name: string }) {
  const saver = useSaver();
  const saved = saver.has(id);
  return (
    <button type="button" disabled={!saver.ready} onClick={() => saver.toggle(id)} aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from your Ready List` : `Save ${name} to your Ready List`}
      className={`absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full border text-xl font-black ${saved ? "pbr-edge bg-[#F97316] text-[#0b1220]" : "border-[#26324c] bg-[#141d2e] text-[#e8edf5]"}`}>
      <span aria-hidden>{saved ? "★" : "☆"}</span>
    </button>
  );
}

/** One exact product as a store tile. `tag` replaces the role badge (a deal's discount). */
export function ProductTile({ id, tag }: { id: string; tag?: string }) {
  const item = itemById(id);
  const pick = item && primaryPick(id);
  if (!item || !pick) return null;
  const color = lanesFor(item)[0]?.color ?? "#F97316";
  return (
    <li className="flex flex-col overflow-hidden rounded-2xl border border-[#26324c] bg-[#141d2e]">
      <div className="relative flex aspect-[3/2] items-center justify-center" style={tint(color)}>
        <span aria-hidden className="text-5xl leading-none">{art(id, item.cat)}</span>
        <span className={`absolute left-2 top-2 ${badge} ${tag ? "pbr-accent" : ""}`}>{tag ?? roleText[pick.role]}</span>
        <SaveStar id={id} name={item.name} />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-[0.68rem] font-black uppercase tracking-wider text-[#94a3b8]">{item.name}</p>
        <h3 className="line-clamp-2 text-sm font-black leading-snug text-[#e8edf5]">{pick.name}</h3>
        <p className="line-clamp-2 text-xs font-semibold leading-5 text-[#94a3b8]">{pick.why}</p>
        <div className="mt-auto pt-2"><ShopButton item={item} tile /></div>
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
      <div className="relative flex items-center gap-3 px-4 py-3" style={tint(color, 16)}>
        <span aria-hidden className="text-3xl leading-none">{art(id, item.cat)}</span>
        <h3 className="pbr-display text-base font-black text-[#e8edf5]">{item.name}</h3>
        <SaveStar id={id} name={item.name} />
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
