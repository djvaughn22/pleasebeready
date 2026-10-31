// Link cards for kits and lanes. Plain links, so they work before any script
// loads. The colored top edge is the lane's color.

import Link from "next/link";
import { kitsInLane, type Kit } from "../../lib/shop/kits";
import { laneById, type Lane } from "../../lib/shop/lanes";

const edge = (color: string) => ({ borderColor: "var(--om-border)", borderTopColor: color });

export function KitCard({ kit }: { kit: Kit }) {
  const color = laneById(kit.lane)?.color ?? "#34D399";
  return (
    <Link href={`/kits/${kit.slug}`} style={edge(color)}
      className="flex h-full flex-col gap-1.5 rounded-2xl border border-t-4 bg-[#141d2e] p-3.5 transition hover:brightness-110">
      <span aria-hidden className="text-2xl leading-none">{kit.emoji}</span>
      <span className="block text-[0.95rem] font-black leading-snug text-[#e8edf5]">{kit.title}</span>
      <span className="block text-xs font-semibold leading-5 text-[#94a3b8]">{kit.short}</span>
    </Link>
  );
}

export function LaneTile({ lane }: { lane: Lane }) {
  const n = kitsInLane(lane.id).length;
  return (
    <Link href={`/shop/${lane.id}`} style={edge(lane.color)}
      className="flex h-full min-h-[4.25rem] items-center gap-3 rounded-xl border border-t-4 bg-[#141d2e] px-3 py-2.5 transition hover:brightness-110">
      <span aria-hidden className="text-2xl leading-none">{lane.emoji}</span>
      <span className="min-w-0">
        <span className="block text-sm font-black leading-tight text-[#e8edf5]">{lane.title}</span>
        <span className="mt-0.5 block text-[0.7rem] font-semibold text-[#94a3b8]">{n} {n === 1 ? "kit" : "kits"}</span>
      </span>
    </Link>
  );
}
