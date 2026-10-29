// Share preview for every page that doesn't set its own: 1200×630 PNG.
// Same colors as the Daily Readiness card (api/social/daily-readiness).

import { ImageResponse } from "next/og";

export const alt = "PleaseBeReady: be ready for whatever is coming";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#0b1220";
const TEXT = "#e8edf5";
const MUTED = "#94a3b8";
const GREEN = "#34D399";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: BG,
          color: TEXT,
          padding: 80,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ width: 140, height: 10, borderRadius: 5, background: GREEN, display: "flex" }} />
        <div style={{ marginTop: 36, fontSize: 30, letterSpacing: 6, color: MUTED, fontWeight: 700 }}>
          PLEASEBEREADY.COM
        </div>
        <div style={{ marginTop: 20, fontSize: 78, fontWeight: 700, lineHeight: 1.1, display: "flex" }}>
          Be ready for whatever is coming
        </div>
        <div style={{ marginTop: 28, fontSize: 36, color: MUTED, lineHeight: 1.35, display: "flex" }}>
          Plan for your people, build the list, shop it. Trips, parties, camping, the pantry and emergencies.
        </div>
      </div>
    ),
    size,
  );
}
