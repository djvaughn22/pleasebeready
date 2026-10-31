// Share preview for every page that doesn't set its own: 1200×630 PNG.

import { ImageResponse } from "next/og";
import { OgCard, ogSize } from "./components/OgCard";

export const alt = "PleaseBeReady: emergency supplies and everyday essentials";
export const size = ogSize;
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <OgCard kicker="PLEASEBEREADY.COM" title="Emergency supplies and everyday essentials"
      sub="Picked product by product, with kits for outages, storms, pets, cars, trips and parties." />,
    size,
  );
}
