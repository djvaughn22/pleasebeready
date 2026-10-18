"use client";

// Print/save, backup, restore, reset and the on-device save switch.
// A backup is a small file the visitor downloads and keeps; it is the only way
// a plan moves between devices, and it never goes through a server.

import { useRef, useState } from "react";
import { parseBackup, toBackup } from "../../lib/planner/storage";
import type { Planner } from "./usePlanner";
import { A, buttonBase, card } from "./ui";

export default function PlanActions({ p }: { p: Planner }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [message, setMessage] = useState("");

  const download = () => {
    const blob = new Blob([JSON.stringify(toBackup(p.state), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pleasebeready-plan.json";
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Backup downloaded.");
  };

  const restore = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 500_000) { setMessage("That file is too large to be a plan backup."); return; }
    const next = parseBackup(await file.text());
    if (next) { p.replace(next); setMessage("Plan restored from the file."); }
    else setMessage("That file is not a PleaseBeReady plan backup.");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className={`${card} mb-8 p-5 print:hidden`}>
      <h2 className="text-base font-black">Your plan stays on this device</h2>
      <p className="mt-1 text-sm font-semibold leading-6 text-[#94a3b8]">
        {p.saving
          ? "This page saves your choices in this browser so you can come back to them here. They are not sent to PleaseBeReady or anyone else, and you do not need an account."
          : "Saving is off. Your choices last until you close or reload this page. Nothing is sent anywhere."}
        {" "}A plan holds only counts, yes/no boxes and numbers. Clearing your browser data removes it.
      </p>
      {p.restored && p.saving && (
        <p className="mt-2 text-sm font-bold pbr-accent">Welcome back. Your saved plan is loaded.</p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => window.print()} className={buttonBase}>Print or save as PDF</button>
        <button type="button" onClick={download} className={buttonBase}>Download a backup</button>
        <button type="button" onClick={() => fileRef.current?.click()} className={buttonBase}>Restore from a backup</button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" tabIndex={-1} aria-label="Choose a plan backup file"
          onChange={(e) => restore(e.target.files?.[0])} />
        {!confirmReset ? (
          <button type="button" onClick={() => setConfirmReset(true)} className={buttonBase}>Reset the plan</button>
        ) : (
          <span className="inline-flex flex-wrap items-center gap-2" role="group" aria-label="Confirm reset">
            <span className="text-sm font-bold">Clear everything on this page?</span>
            <button type="button" onClick={() => { p.reset(); setConfirmReset(false); setMessage("Plan cleared."); }} className={buttonBase}>Yes, clear it</button>
            <button type="button" onClick={() => setConfirmReset(false)} className={buttonBase}>Keep it</button>
          </span>
        )}
      </div>

      <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-2 text-sm font-bold">
        <input type="checkbox" checked={p.saving} onChange={(e) => p.setSavingOn(e.target.checked)}
          className="h-4 w-4" style={{ accentColor: A }} />
        Save my plan on this device
      </label>
      <p role="status" className="min-h-5 text-xs font-bold text-[#94a3b8]">{message}</p>
    </div>
  );
}
