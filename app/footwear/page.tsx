import type { Metadata } from "next";
import Link from "next/link";
import FootwearCompare from "../components/footwear/FootwearCompare";

export const metadata: Metadata = {
  title: "Compare shoes and boots: tread, traction, miles and price",
  description:
    "Compare walking shoes, running shoes, hiking shoes, snow boots and work boots on tread, traction, miles and price, using only what makers and retailers publish.",
  alternates: { canonical: "/footwear" },
};

export default function FootwearPage() {
  return (
    <main className="min-h-screen bg-[#0b1220] text-[#e8edf5]">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        <nav aria-label="Breadcrumb" className="mb-3 text-xs font-bold text-[#94a3b8]">
          <Link href="/" className="hover:underline">Home</Link> › <Link href="/guides" className="hover:underline">Guides</Link>
        </nav>
        <h1 className="text-3xl font-black leading-tight sm:text-4xl">Compare shoes and boots</h1>
        <p className="mt-2 max-w-2xl text-base font-semibold leading-7 text-[#94a3b8]">
          Compare them the way you&apos;d compare tires: tread, traction, miles and price.
        </p>

        <FootwearCompare />

        <section aria-labelledby="fw-how" className="mt-10 rounded-2xl border border-[#26324c] bg-[#141d2e] p-4 sm:p-5">
          <h2 id="fw-how" className="text-lg font-black">How this works</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm font-semibold leading-6 text-[#94a3b8]">
            <li>Tires sold in the US carry a treadwear grade. Shoes have nothing like it, so we don&apos;t make one up and there is no overall score.</li>
            <li>Every fact names its source: the maker, or a store&apos;s listing of the maker&apos;s specs. &quot;Not published&quot; means none of the sources we checked says.</li>
            <li>Miles are your numbers. The starting ranges are labelled with where they come from.</li>
            <li>Cost per mile is the price you type divided by your miles, best case and worst case.</li>
            <li>
              Seven pairs to start. Tell us what to add through{" "}
              <Link href="/about#contact" className="underline decoration-[#26324c] underline-offset-2 hover:text-[#e8edf5]">Contact</Link>.
            </li>
          </ul>
        </section>

        <p className="mx-auto mt-10 max-w-xl text-center text-xs font-semibold leading-6 text-[#94a3b8]">
          As an Amazon Associate, PleaseBeReady earns from qualifying purchases. “Search Amazon” opens search results, not one chosen product.
        </p>
      </div>
    </main>
  );
}
