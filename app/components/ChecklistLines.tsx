"use client";

import { itemId } from "../lib/readiness";
import { useChecks } from "./useChecks";

const A = "#34D399";

export default function ChecklistLines({ areaId, details }: { areaId: string; details: string[] }) {
  const { checked, toggle } = useChecks();
  return (
    <ul className="flex flex-col gap-2">
      {details.map((d) => {
        const id = itemId(areaId, d);
        const done = checked.has(id);
        return (
          <li key={id}>
            <label className="flex cursor-pointer gap-2.5 text-sm font-semibold leading-6 text-[#e8edf5]">
              <input type="checkbox" checked={done} onChange={() => toggle(id)}
                className="mt-1 h-4 w-4 shrink-0 cursor-pointer" style={{ accentColor: A }} />
              <span className={done ? "line-through opacity-60" : undefined}>{d}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
