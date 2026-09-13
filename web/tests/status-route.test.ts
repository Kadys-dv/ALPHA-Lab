import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/status/route";

afterEach(() => vi.unstubAllGlobals());

describe("GET /api/status", () => {
  it("returns the complete public contract and cache policy", async () => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async () => new Response("[]", { status: 200 })));
    const response = await GET();
    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(response.headers.get("X-ALPHA-Status")).toBe("ok");
    expect(response.headers.get("Cache-Control")).toContain("s-maxage=300");
    expect(payload).toMatchObject({
      state: "ok",
      source: { healthySources: 5, totalSources: 5 },
      metrics: { submitted: 0, completionRate: null, willingnessToPay: null },
      targets: { participants: 10, submissions: 7, reviewSlaHours: 48 },
      freshness: { maxAgeSeconds: 900, isFresh: true },
    });
    expect(Date.parse(payload.checkedAt)).not.toBeNaN();
    expect(payload.requestId).toMatch(/^[0-9a-f-]{36}$/);
    expect(response.headers.get("X-Request-Id")).toBe(payload.requestId);
  });

  it("returns partial data when one GitHub source is rate limited", async () => {
    let calls = 0;
    const fetcher = vi.fn().mockImplementation(async () => {
      calls += 1;
      return calls === 1 ? new Response("{}", { status: 429 }) : new Response("[]", { status: 200 });
    });
    vi.stubGlobal("fetch", fetcher);
    const response = await GET();
    const payload = await response.json();
    expect(payload.state).toBe("partial");
    expect(payload.source.healthySources).toBe(4);
    expect(payload.metrics.submitted).toBeNull();
    expect(payload.freshness).toMatchObject({ isFresh: false, source: "degraded" });
  });

  it("does not expose a snapshot as fresh when the current source is degraded", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 429 })));
    const response = await GET();
    const payload = await response.json();
    expect(payload.state).toBe("unavailable");
    expect(payload.freshness.isFresh).toBe(false);
    if (payload.snapshot) expect(payload.snapshot.freshness).toHaveProperty("isFresh");
  });
});
