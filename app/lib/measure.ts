// Aggregate action counts through the site's existing Google Analytics tag.
//
// Only a short label travels (a need id, an area id, an ASIN). Never what
// someone typed, never the supply-math numbers. Browsers that send Do Not
// Track or Global Privacy Control send nothing. No-ops during SSR, in tests,
// and when the tag is blocked.

export type MeasureEvent = "need_select" | "guide_click" | "gear_click";

export function measure(event: MeasureEvent, label: string): void {
  if (typeof window === "undefined") return;
  const nav = window.navigator as Navigator & { globalPrivacyControl?: boolean };
  if (nav.doNotTrack === "1" || nav.globalPrivacyControl === true) return;
  const gtag = (window as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag !== "function") return;
  gtag("event", event, { label: label.replace(/[^A-Za-z0-9-]/g, "").slice(0, 40) });
}
