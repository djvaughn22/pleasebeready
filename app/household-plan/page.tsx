import type { Metadata } from "next";
import Link from "next/link";
import HouseholdPlanForm from "../components/plan/HouseholdPlanForm";
import { READY_FORM_URL, READY_PLAN_URL } from "../lib/householdPlan";

export const metadata: Metadata = {
  title: "Household emergency plan",
  description: "Who to call, where to meet, and the medical details you'd need in a hurry. It stays on this device and prints on one page with a wallet card.",
  alternates: { canonical: "/household-plan" },
};

// Ready.gov's four steps (READY_PLAN_URL), in its own words where it gives them.
const STEPS = [
  ["Meet with your household", "Talk about how you'd reach each other and get back together if you were apart."],
  ["Think about what your household needs", "Medical needs including prescriptions and equipment, access and functional needs, pets or service animals."],
  ["Write it down", "Fill in the plan below. It saves on this device as you type."],
  ["Practice your plan", "Walk through it with your household. Print it, and the wallet card that comes with it."],
] as const;

export default function HouseholdPlanPage() {
  return (
    <main className="min-h-screen bg-[#0b1220] text-[#e8edf5]">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-5 sm:py-10">
        <header className="print:hidden">
          <p className="pbr-accent text-xs font-black uppercase tracking-[0.2em]">Make a plan</p>
          <h1 className="pbr-display mt-2 text-3xl font-black leading-tight sm:text-4xl">Your household emergency plan</h1>
          <p className="pbr-body mt-3 max-w-xl text-base font-semibold leading-7">
            Who to call, where to meet, and the medical details you&apos;d need in a hurry. It stays on this device, and it prints on one page with a wallet card.
          </p>
          <ol className="mt-4 space-y-1.5">
            {STEPS.map(([title, text], i) => (
              <li key={title} className="flex gap-2.5 text-sm leading-5">
                <span className="pbr-accent w-4 shrink-0 font-black">{i + 1}</span>
                <span><b className="font-black">{title}.</b> <span className="font-semibold text-[#94a3b8]">{text}</span></span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs font-semibold text-[#94a3b8]">
            Steps and sections follow <a href={READY_PLAN_URL} target="_blank" rel="noopener noreferrer" className="underline">Ready.gov&apos;s Make a Plan</a>.
            Nothing you type here is sent anywhere.
          </p>
        </header>

        <div className="mt-6">
          <HouseholdPlanForm />
        </div>

        <div className="mt-8 space-y-3 text-sm font-semibold text-[#94a3b8] print:hidden">
          <p>
            <Link href="/" className="pbr-accent font-black">Next: water, food, light and power for your household →</Link>
          </p>
          <p>
            Rather use the official form? <a href={READY_FORM_URL} target="_blank" rel="noopener noreferrer" className="underline">Fill in Ready.gov&apos;s plan</a> and save it as a PDF.
          </p>
          <p className="text-xs leading-5">
            General preparedness information, not professional or medical advice. In any emergency, call your local emergency number and follow official guidance from local authorities.
          </p>
        </div>
      </div>
    </main>
  );
}
