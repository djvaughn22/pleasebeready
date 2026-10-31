// Share preview for one kit, so a post links to a card that names it.

import { ImageResponse } from "next/og";
import { OgCard, ogSize } from "../../components/OgCard";
import { kitBySlug, kits } from "../../lib/shop/kits";
import { laneById } from "../../lib/shop/lanes";

export const alt = "A PleaseBeReady shopping kit";
export const size = ogSize;
export const contentType = "image/png";
export const generateStaticParams = () => kits.map((k) => ({ slug: k.slug }));

export default async function KitImage({ params }: { params: Promise<{ slug: string }> }) {
  const kit = kitBySlug((await params).slug)!;
  return new ImageResponse(
    <OgCard kicker="PLEASEBEREADY.COM · KIT" title={kit.title} sub={kit.intro} color={laneById(kit.lane)?.color}
      foot={`${kit.essentials.length} must-haves · amounts for your group · save it as a list`} />,
    size,
  );
}
