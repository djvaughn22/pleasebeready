// Share preview for one guide.

import { ImageResponse } from "next/og";
import { OgCard, ogSize } from "../../components/OgCard";
import { guideBySlug, guides } from "../../lib/shop/guides";

export const alt = "A PleaseBeReady guide";
export const size = ogSize;
export const contentType = "image/png";
export const generateStaticParams = () => guides.map((g) => ({ slug: g.slug }));

export default async function GuideImage({ params }: { params: Promise<{ slug: string }> }) {
  const g = guideBySlug((await params).slug)!;
  return new ImageResponse(<OgCard kicker="PLEASEBEREADY.COM · GUIDE" title={g.title} sub={g.short} foot="Based on Ready.gov · ends in a shopping list" />, size);
}
