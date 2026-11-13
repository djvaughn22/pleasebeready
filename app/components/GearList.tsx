import { amazonSearchUrl, amazonUrl, type GearItem } from "../lib/gear";
import { backupQuery } from "../lib/shop/backups";
import { pickByAsin } from "../lib/shop/picks";

const A = "#F97316";

// Optional gear stays folded away so the free checklist reads first.
// The disclosure travels with the links, not only at the bottom of the page.
export default function GearList({ gear, label = "Optional gear" }: { gear: GearItem[]; label?: string }) {
  if (gear.length === 0) return null;
  return (
    <details className="group rounded-xl border border-[#26324c] bg-[#0c1220]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-2.5 text-xs font-black text-[#94a3b8] [&::-webkit-details-marker]:hidden">
        <span>🛒 {label} ({gear.length}) · Amazon links</span>
        <span aria-hidden className="transition group-open:rotate-180">▾</span>
      </summary>
      <div className="flex flex-col gap-2 px-3 pb-3">
        <p className="px-1 text-[0.7rem] font-semibold leading-5 text-[#94a3b8]">
          Not required. These links may earn Open Mirror LLC a commission at no extra cost to you.
        </p>
        {gear.map((g) => {
          const q = backupQuery(pickByAsin(g.asin)?.item ?? "", g.name);
          return (
            <div key={g.asin} className="flex flex-col gap-0.5">
              <a href={amazonUrl(g.asin)} target="_blank" rel="noopener noreferrer sponsored"
                data-measure="gear" data-measure-label={g.asin}
                className="inline-flex items-center justify-between gap-3 rounded-lg border border-[#26324c] bg-[#141d2e] px-3 py-2 text-xs font-bold text-[#e8edf5] transition hover:border-[#F97316]">
                <span>{g.name}</span><span style={{ color: A }} aria-hidden>↗</span>
              </a>
              <a href={amazonSearchUrl(q)} target="_blank" rel="noopener noreferrer sponsored"
                data-measure="gear" data-measure-label={`b-${g.asin}`}
                className="inline-flex min-h-6 items-center px-1 text-[0.7rem] font-bold text-[#94a3b8] underline decoration-[#26324c] underline-offset-2 hover:text-[#e8edf5] print:hidden">
                Sold out? Search “{q}” ↗
              </a>
            </div>
          );
        })}
      </div>
    </details>
  );
}
