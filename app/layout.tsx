import type { Metadata } from "next";
import "./globals.css";
import OpenMirrorFooter from "./OpenMirrorFooter";
import OpenMirrorNav from "./OpenMirrorNav";
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL("https://pleasebeready.com"),
  title: "PleaseBeReady.com — Friendly Emergency Preparedness for Everyone",
  description:
    "A calm, friendly guide to getting your household ready — one small step at a time. Water, food, first aid, power, and more. No panic, no bunkers, just practical everyday readiness.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning lang="en" className="antialiased">
      <body>
        <OpenMirrorNav site="PleaseBeReady.com" />
        {children}
        <OpenMirrorFooter siteName="PleaseBeReady.com" accent="#34D399" />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-6GR2LFSSW1"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-6GR2LFSSW1');`}
        </Script>
      </body>
    </html>
  );
}
