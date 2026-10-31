import type { Metadata } from "next";
import "./globals.css";
import OpenMirrorFooter from "./OpenMirrorFooter";
import OpenMirrorNav from "./OpenMirrorNav";
import Script from "next/script";
import ClickMeasure from "./components/ClickMeasure";

export const metadata: Metadata = {
  metadataBase: new URL("https://pleasebeready.com"),
  title: { default: "PleaseBeReady", template: "%s | PleaseBeReady" },
  description:
    "Shopping lists for whatever is coming: power outages, winter storms, a new puppy, a teen's first car, camping, parties and more. Ready-made kits, Amazon links, and lists saved on your device.",
  openGraph: { siteName: "PleaseBeReady", type: "website", locale: "en_US" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning lang="en" className="antialiased">
      <body>
        <OpenMirrorNav
          site="PleaseBeReady.com"
          accent="#34D399"
          links={[
            { emoji: "🔎", name: "Shop", href: "/" },
            { emoji: "🧰", name: "Kits", href: "/kits" },
            { emoji: "⭐", name: "My Ready Lists", href: "/lists" },
            { emoji: "🛒", name: "Shop by need", href: "/shop" },
            { emoji: "📖", name: "Guides", href: "/guides" },
            { emoji: "✅", name: "Emergency checklist", href: "/checklist" },
            { emoji: "🌅", name: "Daily Readiness Check", href: "/today" },
            { emoji: "📚", name: "Preparedness Bookshelf", href: "/books" },
            { emoji: "ℹ️", name: "About PleaseBeReady", href: "/about" },
          ]}
        />
        <ClickMeasure />
        {children}
        <OpenMirrorFooter />
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
