import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About PleaseBeReady",
  description:
    "Friendly emergency preparedness — calm, practical, one small step at a time. Free checklists and a daily readiness habit.",
};

const A = "#34D399";

export default function AboutPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#0b1220", color: "#e8edf5", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px 80px" }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 12px" }}>
          About PleaseBeReady<span style={{ color: A }}>.com</span>
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.65, color: "#94a3b8", margin: "0 0 28px" }}>
          PleaseBeReady is friendly emergency preparedness — no fear, no doomsday talk.
          Water, food, power, medical, documents, and a go-bag, one small step at a time.
        </p>

        <h2 style={{ fontSize: 17, fontWeight: 900, margin: "0 0 8px" }}>What you can do here</h2>
        <ul style={{ fontSize: 15, lineHeight: 1.8, color: "#94a3b8", margin: "0 0 28px", paddingLeft: 18 }}>
          <li>Work through calm, practical checklists for each area of readiness.</li>
          <li>Do one small readiness task a day with the Daily Readiness Check.</li>
          <li>See optional gear, clearly marked 🛒 — never required to be prepared.</li>
        </ul>

        <h2 style={{ fontSize: 17, fontWeight: 900, margin: "0 0 8px" }}>Cost and honesty</h2>
        <p style={{ background: "#141d2e", border: "1px solid #26324c", borderRadius: 14, padding: "14px 16px", fontSize: 15, lineHeight: 1.65, margin: "0 0 28px" }}>
          Free to use, no account, progress saves on this device. Some product links may earn
          Open Mirror LLC a commission at no extra cost to you — as an Amazon Associate,
          PleaseBeReady earns from qualifying purchases. Guidance here is general preparedness
          information, not professional or medical advice.
        </p>

        <p style={{ fontSize: 13, lineHeight: 1.7, color: "#64748b", margin: 0 }}>
          PleaseBeReady is an{" "}
          <a href="https://openmirrorllc.com" style={{ color: A, textDecoration: "none" }}>
            Open Mirror LLC
          </a>{" "}
          project.
        </p>
      </div>
    </main>
  );
}
