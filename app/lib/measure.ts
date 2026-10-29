// Aggregate action counts through the site's existing Google Analytics tag.
//
// Only a short label travels (a need id, an area id, an ASIN, a situation or
// catalog id). Never what someone typed, never plan names, people counts or
// amounts. Amazon purchases are NOT visible here; only Associates reports show them. Browsers that send Do Not
// Track or Global Privacy Control send nothing. No-ops during SSR, in tests,
// and when the tag is blocked.

export type MeasureEvent =
  | "need_select" | "guide_click" | "gear_click"
  /** Stock-up planner: a plan was created. Label: <picker|link|shared>-<situation>. */
  | "plan_start"
  /** Items went onto a list. Label: <one|ticked|category|all>-<situation>. */
  | "plan_add"
  /** A planner Shop/Search link was opened. Label: <category>-<p|s>-<item id> (p = product page, s = search). */
  | "shop_click";

export function measure(event: MeasureEvent, label: string): void {
  if (typeof window === "undefined") return;
  const nav = window.navigator as Navigator & { globalPrivacyControl?: boolean };
  if (nav.doNotTrack === "1" || nav.globalPrivacyControl === true) return;
  const gtag = (window as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag !== "function") return;
  gtag("event", event, { label: label.replace(/[^A-Za-z0-9-]/g, "").slice(0, 40) });
}
