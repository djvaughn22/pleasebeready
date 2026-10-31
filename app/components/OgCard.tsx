// The 1200×630 share card used by every page's preview image. Same colors as
// the Daily Readiness card (api/social/daily-readiness). No emoji: next/og
// would fetch an emoji font at build time.

const BG = "#0b1220";
const TEXT = "#e8edf5";
const MUTED = "#94a3b8";

export const ogSize = { width: 1200, height: 630 };

export function OgCard({ kicker, title, sub, color = "#F97316", foot }: { kicker: string; title: string; sub: string; color?: string; foot?: string }) {
  return (
    <div style={{ width: 1200, height: 630, display: "flex", flexDirection: "column", justifyContent: "center", background: BG, color: TEXT, padding: 80, fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        {/* The brand mark (components/Brand.tsx), drawn inline: next/og can't import it. */}
        <svg viewBox="0 0 96 96" width="72" height="72">
          <rect width="96" height="96" rx="24" fill="#F97316" />
          <path d="M37 43V31a11 11 0 0 1 22 0v12" fill="none" stroke={BG} strokeWidth="5.5" strokeLinecap="round" />
          <path d="M19 37h58l-4.2 37.4a7 7 0 0 1-7 6.2H30.2a7 7 0 0 1-7-6.2Z" fill={BG} />
          <circle cx="37" cy="44" r="2.5" fill="#F97316" />
          <circle cx="59" cy="44" r="2.5" fill="#F97316" />
          <path d="M36.5 63l8 8L61 54.5" fill="none" stroke="#F97316" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div style={{ display: "flex", fontSize: 40, fontWeight: 700 }}>PleaseBe<span style={{ color: "#F97316" }}>Ready</span></div>
        <div style={{ width: 90, height: 10, borderRadius: 5, background: color, display: "flex", marginLeft: 12 }} />
      </div>
      <div style={{ marginTop: 36, fontSize: 30, letterSpacing: 6, color: MUTED, fontWeight: 700, display: "flex" }}>{kicker}</div>
      <div style={{ marginTop: 20, fontSize: title.length > 28 ? 68 : 78, fontWeight: 700, lineHeight: 1.1, display: "flex" }}>{title}</div>
      <div style={{ marginTop: 28, fontSize: 36, color: MUTED, lineHeight: 1.35, display: "flex" }}>{sub}</div>
      {foot && <div style={{ marginTop: 40, fontSize: 28, color, fontWeight: 700, display: "flex" }}>{foot}</div>}
    </div>
  );
}
