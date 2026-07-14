// Protected Daily Readiness Check publishing admin (shared Daily Social
// Engine). Open /admin/social?key=SOCIAL_ADMIN_KEY — 404s without the key.
// "Next task" steps the deterministic rotation with ?offset=N.

import { notFound } from "next/navigation";
import AdminDailyPanel from "../../components/AdminDailyPanel";
import { buildDailyReadiness, PBR_BRAND } from "../../lib/dailyReadiness";
import { addDaysToDateKey, chicagoDateKey } from "../../lib/dailySocialCore";
import { missingCredentials, readPublishConfig } from "../../lib/instagramPublisherCore";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ key?: string | string[]; offset?: string | string[] }>;
};

export default async function AdminSocialPage({ searchParams }: PageProps) {
  const resolved = await searchParams;
  const providedKey = Array.isArray(resolved.key) ? resolved.key[0] : resolved.key;
  const adminKey = process.env.SOCIAL_ADMIN_KEY?.trim();

  if (!adminKey || providedKey !== adminKey) {
    notFound();
  }

  const offsetRaw = Array.isArray(resolved.offset) ? resolved.offset[0] : resolved.offset;
  const offset = Math.max(0, Number(offsetRaw) || 0);

  const today = chicagoDateKey();
  const tomorrow = addDaysToDateKey(today, 1);
  const config = readPublishConfig();
  const missing = missingCredentials(config);

  const days = [
    { label: "Today", date: today },
    { label: "Tomorrow (preview)", date: tomorrow },
  ].map(({ label, date }) => ({
    label,
    date,
    data: buildDailyReadiness(date, { offset }),
  }));

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 text-[#e8edf5]">
      <h1 className="text-2xl font-black">Daily Readiness Check — Instagram admin</h1>

      <div className="mt-4 rounded-2xl border border-[#26324c] bg-[#141d2e] p-4 text-sm font-semibold leading-6 text-[#94a3b8]">
        <p>
          Destination account:{" "}
          <span className="text-[#e8edf5]">
            {config.accountId ? `…${config.accountId.slice(-4)}` : "not configured"}
          </span>
        </p>
        <p>
          Credentials:{" "}
          {missing.length ? (
            <span className="text-yellow-200">missing {missing.join(", ")}</span>
          ) : (
            <span style={{ color: "#34D399" }}>configured</span>
          )}
        </p>
        <p>
          Automatic publishing:{" "}
          {config.autopublishEnabled ? (
            <span style={{ color: "#34D399" }}>ENABLED</span>
          ) : (
            <span className="text-yellow-200">PAUSED (INSTAGRAM_AUTOPUBLISH_ENABLED)</span>
          )}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-bold">
        <span className="text-[#94a3b8]">Selection:</span>
        <a
          className={`rounded-full border border-[#26324c] px-4 py-1.5 ${offset === 0 ? "text-[#0b1220]" : "bg-[#141d2e]"}`}
          style={offset === 0 ? { background: "#34D399" } : undefined}
          href={`?key=${encodeURIComponent(adminKey)}`}
        >
          Today&apos;s task
        </a>
        <a
          className="rounded-full border border-[#26324c] bg-[#141d2e] px-4 py-1.5"
          href={`?key=${encodeURIComponent(adminKey)}&offset=${offset + 1}`}
        >
          Next task (#{offset + 1}) →
        </a>
      </div>

      {days.map(({ label, date, data }) => (
        <section key={label} className="mt-8 rounded-3xl border border-[#26324c] bg-[#141d2e] p-5">
          <h2 className="text-lg font-black">
            {label} — {date}
          </h2>
          <p className="mt-1 text-xs font-semibold text-[#94a3b8]">
            {data.task.emoji} {data.task.area} · {data.task.title}
            {data.task.gear ? ` · gear: ${data.task.gear.name}` : " · no gear link"}
            {" · "}
            <a style={{ color: "#34D399" }} href="/today">
              /today
            </a>
          </p>
          <AdminDailyPanel
            adminKey={adminKey}
            date={data.post.date}
            caption={data.post.caption}
            imagePath={data.post.imagePath}
            imageFileName={data.post.imageFileName}
            extraParams={offset ? { offset: String(offset) } : {}}
          />
        </section>
      ))}

      <p className="mt-6 text-xs font-semibold leading-5 text-[#94a3b8]">
        Version {PBR_BRAND.version}. The deck is {""}
        deterministic: day N since {PBR_BRAND.startDate} gets task N in
        rotation, so the page, the card, and the caption always agree.
      </p>
    </main>
  );
}
