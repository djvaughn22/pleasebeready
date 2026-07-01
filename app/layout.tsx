import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PleaseBeReady.com — Friendly Emergency Preparedness for Everyone",
  description:
    "A calm, friendly guide to getting your household ready — one small step at a time. Water, food, first aid, power, and more. No panic, no bunkers, just practical everyday readiness.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <body>{children}</body>
    </html>
  );
}
