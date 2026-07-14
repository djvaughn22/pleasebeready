// Daily Readiness Check → Instagram publish endpoint (shared Daily Social
// Engine). Auth, modes, pause switch, duplicate ledger, and logging all come
// from createDailyPublishHandler — see app/lib/publishRouteCore.ts.

import { createDailyPublishHandler } from "../../../../lib/publishRouteCore";
import { buildDailyReadiness, PBR_BRAND } from "../../../../lib/dailyReadiness";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const handler = createDailyPublishHandler({
  brandConfig: PBR_BRAND,
  buildPost: async (dateKey, { searchParams }) => {
    const offset = Number(searchParams.get("offset")) || 0;
    const { post } = buildDailyReadiness(dateKey, { offset });
    return post;
  },
});

export async function GET(request: Request) {
  return handler(request);
}

export async function POST(request: Request) {
  return handler(request);
}
