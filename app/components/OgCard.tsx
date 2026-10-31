// The 1200×630 share card used by every page's preview image. Same colors as
// the Daily Readiness card (api/social/daily-readiness). No emoji: next/og
// would fetch an emoji font at build time.

const BG = "#0b1220";
const TEXT = "#e8edf5";
const MUTED = "#94a3b8";

export const ogSize = { width: 1200, height: 630 };

export function OgCard({ kicker, title, sub, color = "#34D399", foot }: { kicker: string; title: string; sub: string; color?: string; foot?: string }) {
  return (
    <div style={{ width: 1200, height: 630, display: "flex", flexDirection: "column", justifyContent: "center", background: BG, color: TEXT, padding: 80, fontFamily: "sans-serif" }}>
      <div style={{ width: 140, height: 10, borderRadius: 5, background: color, display: "flex" }} />
      <div style={{ marginTop: 36, fontSize: 30, letterSpacing: 6, color: MUTED, fontWeight: 700, display: "flex" }}>{kicker}</div>
      <div style={{ marginTop: 20, fontSize: title.length > 28 ? 68 : 78, fontWeight: 700, lineHeight: 1.1, display: "flex" }}>{title}</div>
      <div style={{ marginTop: 28, fontSize: 36, color: MUTED, lineHeight: 1.35, display: "flex" }}>{sub}</div>
      {foot && <div style={{ marginTop: 40, fontSize: 28, color, fontWeight: 700, display: "flex" }}>{foot}</div>}
    </div>
  );
}
