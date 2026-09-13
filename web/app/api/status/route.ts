import { NextResponse } from "next/server";
import { buildPublicStatus, fetchIssuesByLabel } from "@/lib/public-status";
import { randomUUID } from "node:crypto";

type PublicStatus = ReturnType<typeof buildPublicStatus>;
type SnapshotStore = { get(key: string, type?: "json"): Promise<{ status: PublicStatus; checkedAt: string } | null>; put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void> };
let lastKnownGood: { status: PublicStatus; checkedAt: string } | null = null;
const FRESHNESS_LIMIT_MS = 15 * 60 * 1000;
const snapshotStore = (globalThis as unknown as { ALPHA_STATUS_SNAPSHOT?: SnapshotStore }).ALPHA_STATUS_SNAPSHOT;

export async function GET() {
  const requestId = randomUUID();
  const checkedAt = new Date().toISOString();
  let sources;
  try {
    sources = await Promise.all([
      fetchIssuesByLabel("submission"), fetchIssuesByLabel("under-review"),
      fetchIssuesByLabel("accepted"), fetchIssuesByLabel("pilot-started"),
      fetchIssuesByLabel("pilot-feedback"),
    ]);
  } catch {
    sources = Array.from({ length: 5 }, () => ({ ok: false, items: [], error: "github_unreachable" }));
  }
  const [submitted,underReview,accepted,started,feedback] = sources;
  const status = buildPublicStatus(submitted, underReview, accepted, started, feedback);
  if (status.state === "ok") {
    lastKnownGood = { status, checkedAt };
    if (snapshotStore) await snapshotStore.put("public-status", JSON.stringify(lastKnownGood), { expirationTtl: 24 * 60 * 60 });
  } else if (!lastKnownGood && snapshotStore) {
    lastKnownGood = await snapshotStore.get("public-status");
  }
  const snapshotAgeMs = lastKnownGood ? Date.now() - Date.parse(lastKnownGood.checkedAt) : null;
  const sourceIsFresh = status.state === "ok";
  return NextResponse.json(
    {
      ...status,
      checkedAt,
      requestId,
      freshness: {
        checkedAt,
        ageSeconds: 0,
        maxAgeSeconds: FRESHNESS_LIMIT_MS / 1000,
        isFresh: sourceIsFresh,
        source: sourceIsFresh ? "github" : "degraded",
      },
      ...(lastKnownGood ? {
        snapshot: {
          checkedAt: lastKnownGood.checkedAt,
          state: lastKnownGood.status.state,
          metrics: lastKnownGood.status.metrics,
          freshness: {
            ageSeconds: Math.max(0, Math.round((snapshotAgeMs ?? 0) / 1000)),
            maxAgeSeconds: FRESHNESS_LIMIT_MS / 1000,
            isFresh: (snapshotAgeMs ?? Infinity) <= FRESHNESS_LIMIT_MS,
          },
        },
      } : {}),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "X-ALPHA-Status": status.state,
        "X-Request-Id": requestId,
      },
    },
  );
}
