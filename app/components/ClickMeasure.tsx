"use client";

// One delegated listener for links marked data-measure="guide|gear" and
// data-measure-label="<area id or ASIN>", so server-rendered links can be
// counted without becoming client components.

import { useEffect } from "react";
import { measure } from "../lib/measure";

export default function ClickMeasure() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[data-measure]");
      if (!a) return;
      const kind = a.getAttribute("data-measure");
      const label = a.getAttribute("data-measure-label") ?? "";
      if (kind === "guide") measure("guide_click", label);
      else if (kind === "gear") measure("gear_click", label);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}
