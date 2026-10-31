// Share preview for every page that doesn't set its own: 1200×630 PNG.

import { ImageResponse } from "next/og";
import { OgCard, ogSize } from "./components/OgCard";

export const alt = "PleaseBeReady: what do you want to be ready for?";
export const size = ogSize;
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <OgCard kicker="PLEASEBEREADY.COM" title="What do you want to be ready for?"
      sub="Kits and shopping lists for outages, storms, pets, cars, trips, parties and more." />,
    size,
  );
}
