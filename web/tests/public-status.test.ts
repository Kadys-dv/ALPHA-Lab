import { describe, expect, it, vi } from "vitest";
import { acceptedAt, buildPublicStatus, fetchIssuesByLabel, type GitHubIssue } from "@/lib/public-status";

const submissionBody = (accepted?: string) => `Repository: https://github.com/acme/demo\nEvidence: https://github.com/acme/demo/pull/7\nWallet: 0x1111111111111111111111111111111111111111${accepted ? `\n\n<!-- alpha-accepted-at: ${accepted} -->` : ""}`;
const source = (items: GitHubIssue[]) => ({ ok: true, items });

describe("public status", () => {
  it("paginates GitHub issues until a short page", async () => {
    const fullPage = Array.from({ length: 100 }, (_, number) => ({ number }));
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(fullPage)))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ number: 101 }])));
    const result = await fetchIssuesByLabel("accepted", fetcher);
    expect(result.items).toHaveLength(101);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("uses the recorded acceptance instant and excludes accepted issues from review", () => {
    const issue: GitHubIssue = { number: 1, body: submissionBody("2026-09-01T12:00:00.000Z"), created_at: "2026-09-01T10:00:00.000Z", labels: [{ name: "submission" }, { name: "under-review" }, { name: "accepted" }] };
    issue.user = { login: "builder" };
    const result = buildPublicStatus(source([issue]), source([issue]), source([issue]), source([{ number: 2, user: { login: "builder" } }]), source([]));
    expect(result.metrics.underReview).toBe(0);
    expect(result.metrics.averageReviewHours).toBe(2);
    expect(result.metrics.completionRate).toBe(100);
  });

  it("separates completion, acceptance and feedback metrics", () => {
    const submitted = source([{ number: 1, user: { login: "one" } }, { number: 2, user: { login: "two" } }]);
    const started = source([{ number: 10, body: "### Repository\n\nhttps://github.com/acme/demo", user: { login: "one" } }, { number: 11, user: { login: "two" } }, { number: 12, user: { login: "three" } }, { number: 13, user: { login: "four" } }]);
    const accepted = source([{ number: 1, labels: [{ name: "submission" }] }]);
    const feedbackBody = "### Submission\n\n1\n\n### Preferencia de feedback\n\nprivado\n\n### A revisão foi útil?\n\nsim\n\n### Você aplicou a recomendação principal?\n\nsim\n\n### Você faria outro ciclo nas próximas quatro semanas?\n\ntalvez\n\n### Você pagaria por uma revisão individual?\n\nsim";
    const feedback = source([
      { number: 20, body: feedbackBody, user: { login: "one" }, updated_at: "2026-09-02T00:00:00Z" },
      { number: 21, body: feedbackBody, user: { login: "one" }, updated_at: "2026-09-01T00:00:00Z" },
      { number: 22, body: feedbackBody.replace("### Submission\n\n1", "### Submission\n\n999"), user: { login: "two" } },
    ]);
    const result = buildPublicStatus(submitted, source([]), accepted, started, feedback);
    expect(result.metrics.completionRate).toBe(50);
    expect(result.metrics.approvalRate).toBe(50);
    expect(result.metrics.dropoffs).toBe(2);
    expect(result.metrics.usefulRate).toBe(100);
    expect(result.metrics.willingnessToPay).toBe(1);
    expect(result.metrics.feedbackCount).toBe(1);
    expect(result.metrics.privateFeedbackRequests).toBe(1);
    expect(result.startedCohort[0]).toMatchObject({ issue: 10, author: "one", repository: "https://github.com/acme/demo" });
    expect(result.rubricVersion).toBe(1);
  });

  it("exposes an SLA queue for under-review submissions", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-13T12:00:00.000Z"));
    const review = source([{ number: 2, created_at: "2026-09-11T11:00:00.000Z", user: { login: "builder" }, labels: [{ name: "submission" }, { name: "under-review" }] }]);
    const result = buildPublicStatus(source([]), review, source([]), source([]), source([]));
    expect(result.reviewQueue[0]).toMatchObject({ issue: 2, author: "builder", ageHours: 49, slaBreached: true });
    vi.useRealTimers();
  });

  it("does not invent a review duration for legacy acceptance", () => {
    const issue = { number: 1, body: submissionBody(), created_at: "2026-09-01T10:00:00.000Z", labels: [{ name: "submission" }, { name: "accepted" }] };
    expect(buildPublicStatus(source([issue]), source([]), source([issue])).metrics.averageReviewHours).toBeNull();
    expect(acceptedAt(issue.body)).toBeNull();
  });
});
