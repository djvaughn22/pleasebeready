import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The stock-up planner is now My Ready Lists. Query strings (?start=, utm_…) pass
  // through, and browsers keep the #plan= share fragment across the redirect.
  async redirects() {
    return [{ source: "/planner", destination: "/lists", permanent: true }];
  },
};

export default nextConfig;
