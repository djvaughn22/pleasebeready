// Daily Readiness Check Instagram card.
// GET /api/social/daily-readiness/2026-07-14.png → 1080×1350 PNG (4:5)
// ?offset=N previews an alternative task (admin control).
// Rendered from the same task object as /today and the caption.

import { ImageResponse } from "next/og";
import { buildDailyReadiness, PBR_BRAND } from "../../../../lib/dailyReadiness";
import { isValidDateKey } from "../../../../lib/dailySocialCore";

export const dynamic = "force-dynamic";

const BG = "#0b1220";
const SURFACE = "#141d2e";
const BORDER = "#26324c";
const TEXT = "#e8edf5";
const MUTED = "#94a3b8";
const GREEN = "#34D399";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ image: string }> },
) {
  const { image } = await params;
  const dateKey = image.replace(/\.png$/i, "");

  if (!isValidDateKey(dateKey) || dateKey < PBR_BRAND.startDate) {
    return new Response("Not found", { status: 404 });
  }

  const offset = Number(new URL(request.url).searchParams.get("offset")) || 0;

  try {
    const { task, post } = buildDailyReadiness(dateKey, { offset });

    return new ImageResponse(
      (
        <div
          style={{
            width: 1080,
            height: 1350,
            display: "flex",
            flexDirection: "column",
            background: BG,
            color: TEXT,
            padding: 72,
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 30, letterSpacing: 8, color: GREEN, fontWeight: 700 }}>
              DAILY READINESS CHECK
            </div>
            <div style={{ marginTop: 12, fontSize: 28, color: MUTED, fontWeight: 700 }}>
              {post.fullDate}
            </div>
          </div>

          <div
            style={{
              marginTop: 56,
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
              background: SURFACE,
              border: `2px solid ${BORDER}`,
              borderRadius: 40,
              padding: 64,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <div style={{ fontSize: 64, display: "flex" }}>{task.emoji}</div>
              <div style={{ fontSize: 30, letterSpacing: 5, color: GREEN, fontWeight: 700 }}>
                {task.area.toUpperCase()}
              </div>
            </div>

            <div
              style={{
                marginTop: 48,
                fontSize: 76,
                fontWeight: 700,
                lineHeight: 1.15,
                display: "flex",
              }}
            >
              {task.title}
            </div>

            <div
              style={{
                marginTop: 40,
                fontSize: 38,
                lineHeight: 1.5,
                color: MUTED,
                fontWeight: 600,
                display: "flex",
              }}
            >
              {task.detail}
            </div>
          </div>

          <div
            style={{
              marginTop: 56,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 28, color: MUTED, fontWeight: 700 }}>
              One small step a day.
            </div>
            <div style={{ fontSize: 28, color: GREEN, fontWeight: 700, letterSpacing: 3 }}>
              PLEASEBEREADY.COM/TODAY
            </div>
          </div>
        </div>
      ),
      { width: 1080, height: 1350 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "unavailable";
    return new Response(`No card: ${message}`, { status: 503 });
  }
}
