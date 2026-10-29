// Sources the stock-up planner cites for official amounts. Each page was read on the `checked` date below;
// `pageUpdated` is the date the page itself showed. Re-read a page before
// changing any advice that cites it, and bump `checked`.

import type { Source, SourceId } from "./types";

export const CHECKED = "2026-10-17";

export const sources: Record<SourceId, Source> = {
  "rc-kit": {
    id: "rc-kit", agency: "American Red Cross", title: "Survival Kit Supplies",
    href: "https://www.redcross.org/get-help/how-to-prepare-for-emergencies/survival-kit-supplies.html",
    checked: CHECKED,
  },
  "rg-kit": {
    id: "rg-kit", agency: "Ready.gov (FEMA)", title: "Build a Kit",
    href: "https://www.ready.gov/kit", checked: CHECKED, pageUpdated: "2026-07-01",
  },
  "rg-water": {
    id: "rg-water", agency: "Ready.gov (FEMA)", title: "Water",
    href: "https://www.ready.gov/water", checked: CHECKED, pageUpdated: "2021-02-22",
  },
  "rg-food": {
    id: "rg-food", agency: "Ready.gov (FEMA)", title: "Food",
    href: "https://www.ready.gov/food", checked: CHECKED, pageUpdated: "2026-03-12",
  },
  "rg-power": {
    id: "rg-power", agency: "Ready.gov (FEMA)", title: "Power Outages",
    href: "https://www.ready.gov/power-outages", checked: CHECKED, pageUpdated: "2026-06-04",
  },
  "rg-pets": {
    id: "rg-pets", agency: "Ready.gov (FEMA)", title: "Pets and Animals",
    href: "https://www.ready.gov/pets", checked: CHECKED, pageUpdated: "2026-03-20",
  },
  "rg-disability": {
    id: "rg-disability", agency: "Ready.gov (FEMA)", title: "People with Disabilities",
    href: "https://www.ready.gov/people-disabilities", checked: CHECKED, pageUpdated: "2026-09-09",
  },
  "rg-older": {
    id: "rg-older", agency: "Ready.gov (FEMA)", title: "Older Adults",
    href: "https://www.ready.gov/older-adults", checked: CHECKED, pageUpdated: "2026-03-26",
  },
  "rg-plan": {
    id: "rg-plan", agency: "Ready.gov (FEMA)", title: "Make a Plan",
    href: "https://www.ready.gov/plan", checked: CHECKED, pageUpdated: "2026-09-01",
  },
  "rg-financial": {
    id: "rg-financial", agency: "Ready.gov (FEMA)", title: "Financial Preparedness",
    href: "https://www.ready.gov/financial-preparedness", checked: CHECKED, pageUpdated: "2026-03-13",
  },
  "rg-winter": {
    id: "rg-winter", agency: "Ready.gov (FEMA)", title: "Winter Weather",
    href: "https://www.ready.gov/winter-weather", checked: CHECKED,
  },
  "rg-evacuation": {
    id: "rg-evacuation", agency: "Ready.gov (FEMA)", title: "Evacuation",
    href: "https://www.ready.gov/evacuation", checked: CHECKED, pageUpdated: "2026-03-20",
  },
  "cdc-water": {
    id: "cdc-water", agency: "CDC", title: "How to Make Water Safe in an Emergency",
    href: "https://www.cdc.gov/water-emergency/about/index.html", checked: CHECKED, pageUpdated: "2024-09-19",
  },
};

export const sourceList: Source[] = Object.values(sources);

/** "Oct 17, 2026" from an ISO date, without a timezone shift. */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[m - 1]} ${d}, ${y}`;
}
