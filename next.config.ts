import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Nov 15 2026 (Nov 14 audit): three low-risk security headers on every page.
  // No Content-Security-Policy yet; that needs a report-only trial first.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
  // The stock-up planner is now My Ready Lists. Query strings (?start=, utm_…) pass
  // through, and browsers keep the #plan= share fragment across the redirect.
  async redirects() {
    return [{ source: "/planner", destination: "/lists", permanent: true }];
  },
};

export default nextConfig;
