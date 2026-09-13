import { parseSubmission } from "@/lib/validation";

export const GITHUB_REPOSITORY = "Kadys-dv/ALPHA-Lab";
const ACCEPTED_AT = /<!-- alpha-accepted-at: ([^ ]+) -->/;
const REVIEW_RECORD = /<!-- alpha-review-record\s*\n([\s\S]*?)\n-->/;
const RUBRIC_KEYS = ["context", "installation", "decisions", "tests", "demo"] as const;
const REVIEW_SLA_HOURS = 48;

export type GitHubIssue = {
  number: number;
  body?: string | null;
  created_at?: string;
  updated_at?: string;
  title?: string;
  labels?: Array<string | { name?: string | null }>;
  user?: { login?: string | null };
  pull_request?: unknown;
};

export type IssueSource = { ok: boolean; items: GitHubIssue[]; error?: string };

const labelNames = (issue: GitHubIssue) =>
  (issue.labels ?? []).map((label) => typeof label === "string" ? label : label.name).filter(Boolean);

export function acceptedAt(body: string | null | undefined): string | null {
  const value = body?.match(ACCEPTED_AT)?.[1];
  return value && !Number.isNaN(Date.parse(value)) ? value : null;
}

export async function fetchIssuesByLabel(
  label: string,
  fetcher: typeof fetch = fetch,
): Promise<IssueSource> {
  const items: GitHubIssue[] = [];
  try {
    for (let page = 1; ; page += 1) {
      const params = new URLSearchParams({ state: "all", labels: label, per_page: "100", page: String(page), sort: "updated", direction: "desc" });
      const token = process.env.GITHUB_TOKEN;
      const response = await fetcher(`https://api.github.com/repos/${GITHUB_REPOSITORY}/issues?${params}`, {
        headers: { Accept: "application/vnd.github+json", "User-Agent": "alpha-builders-status", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(8_000),
      });
      if (!response.ok) return { ok: false, items: [], error: `github_${response.status}` };
      const payload: unknown = await response.json();
      if (!Array.isArray(payload)) return { ok: false, items: [], error: "github_invalid_payload" };
      const pageItems = payload.filter((item): item is GitHubIssue =>
        typeof item === "object" && item !== null &&
        typeof (item as { number?: unknown }).number === "number",
      );
      items.push(...pageItems.filter((issue) => !issue.pull_request));
      if (pageItems.length < 100) break;
    }
    return { ok: true, items };
  } catch {
    return { ok: false, items: [], error: "github_unreachable" };
  }
}

const round = (value: number) => Math.round(value * 10) / 10;

export function buildPublicStatus(submitted: IssueSource, underReview: IssueSource, accepted: IssueSource, started: IssueSource = { ok: false, items: [] }, feedback: IssueSource = { ok: false, items: [] }) {
  const acceptedIssues = accepted.ok
    ? accepted.items.filter((issue) => labelNames(issue).includes("submission"))
    : [];
  const reviewIssues = underReview.ok
    ? underReview.items.filter((issue) => !labelNames(issue).includes("accepted"))
    : [];
  const parsedAccepted = acceptedIssues.flatMap((issue) => {
    const parsed = parseSubmission(issue.body ?? "");
    return parsed ? [{ issue: issue.number, createdAt: issue.created_at ?? null, acceptedAt: acceptedAt(issue.body), ...parsed }] : [];
  });
  const builders = parsedAccepted.slice(0, 12).map((builder) => ({
    issue: builder.issue,
    cycleId: builder.cycleId ?? null,
    repoUrl: builder.repoUrl,
    evidenceUrl: builder.evidenceUrl,
    wallet: `${builder.wallet.slice(0, 6)}…${builder.wallet.slice(-4)}`,
    status: "accepted",
  }));
  const uniqueBuilders = accepted.ok ? new Set(parsedAccepted.map((builder) => builder.wallet.toLowerCase())).size : null;
  const distinctProjects = accepted.ok ? new Set(parsedAccepted.map((builder) => builder.repoUrl.toLowerCase())).size : null;
  const counts = (key: "wallet" | "repoUrl") => parsedAccepted.reduce<Map<string, number>>((result, builder) => {
    const value = builder[key].toLowerCase();
    result.set(value, (result.get(value) ?? 0) + 1);
    return result;
  }, new Map());
  const walletCounts = accepted.ok ? counts("wallet") : null;
  const projectCounts = accepted.ok ? counts("repoUrl") : null;
  const submittedCount = submitted.ok ? submitted.items.length : null;
  const acceptedCount = accepted.ok ? acceptedIssues.length : null;
  const reviewHours = parsedAccepted.flatMap((builder) => builder.createdAt && builder.acceptedAt
    ? [(Date.parse(builder.acceptedAt) - Date.parse(builder.createdAt)) / 3_600_000]
    : []);
  const sortedReviewHours = reviewHours.toSorted((a, b) => a - b);
  const percentile = (values: number[], ratio: number) => values.length ? round(values[Math.ceil(values.length * ratio) - 1]) : null;
  const rubricCounts = Object.fromEntries(RUBRIC_KEYS.map((key) => [key, { approved: 0, adjustments: 0, measured: 0 }]));
  for (const issue of acceptedIssues) {
    try {
      const record = JSON.parse(issue.body?.match(REVIEW_RECORD)?.[1] ?? "null") as { criteria?: Record<string, string> } | null;
      for (const key of RUBRIC_KEYS) {
        const rating = record?.criteria?.[key];
        if (rating === "aprovado") { rubricCounts[key].approved += 1; rubricCounts[key].measured += 1; }
        if (rating === "ajustes necessários") { rubricCounts[key].adjustments += 1; rubricCounts[key].measured += 1; }
      }
    } catch { /* Invalid legacy records do not become metrics. */ }
  }
  const feedbackValue = (body: string | null | undefined, label: string) => body?.match(new RegExp(`### ${label}\\s+\\n\\s*([^\\n]+)`, "i"))?.[1]?.trim().toLowerCase();
  const acceptedNumbers = new Set(acceptedIssues.map((issue) => issue.number));
  const feedbackByParticipant = new Map<string, GitHubIssue>();
  for (const issue of feedback.ok ? feedback.items.toSorted((a, b) => Date.parse(b.updated_at ?? "") - Date.parse(a.updated_at ?? "")) : []) {
    const submissionNumber = Number(feedbackValue(issue.body, "Submission") ?? issue.title?.match(/#(\d+)/)?.[1]);
    const participant = issue.user?.login?.toLowerCase();
    if (!participant || !acceptedNumbers.has(submissionNumber)) continue;
    const key = `${participant}:${submissionNumber}`;
    if (!feedbackByParticipant.has(key)) feedbackByParticipant.set(key, issue);
  }
  const feedbackItems = [...feedbackByParticipant.values()];
  const countFeedback = (label: string, expected: string) => feedbackItems.filter((issue) => feedbackValue(issue.body, label) === expected).length;
  const privateFeedbackRequests = feedback.ok ? feedbackItems.filter((issue) => feedbackValue(issue.body, "Preferencia de feedback") === "privado").length : null;
  const participantIds = (source: IssueSource) => new Set(source.items.flatMap((issue) => issue.user?.login ? [issue.user.login.toLowerCase()] : []));
  const startedParticipants = started.ok ? participantIds(started) : null;
  const submittedParticipants = submitted.ok ? participantIds(submitted) : null;
  const completedParticipants = startedParticipants && submittedParticipants
    ? [...startedParticipants].filter((participant) => submittedParticipants.has(participant)).length
    : null;
  const startedCount = startedParticipants?.size ?? null;
  const startedCohort = started.ok ? started.items.slice(0, 10).map((issue) => ({
    issue: issue.number,
    author: issue.user?.login ?? "unknown",
    repository: feedbackValue(issue.body, "Repository") ?? null,
    openedAt: issue.created_at ?? null,
  })) : [];
  const now = Date.now();
  const reviewQueue = reviewIssues
    .map((issue) => {
      const openedAt = issue.created_at ?? null;
      const ageHours = openedAt && !Number.isNaN(Date.parse(openedAt)) ? round((now - Date.parse(openedAt)) / 3_600_000) : null;
      return {
        issue: issue.number,
        author: issue.user?.login ?? "unknown",
        openedAt,
        ageHours,
        slaBreached: ageHours !== null ? ageHours > REVIEW_SLA_HOURS : false,
      };
    })
    .sort((a, b) => (b.ageHours ?? -1) - (a.ageHours ?? -1))
    .slice(0, 10);
  const successfulSources = [submitted.ok, underReview.ok, accepted.ok, started.ok, feedback.ok].filter(Boolean).length;

  return {
    state: successfulSources === 5 ? "ok" : successfulSources === 0 ? "unavailable" : "partial",
    source: { provider: "github", repository: GITHUB_REPOSITORY, healthySources: successfulSources, totalSources: 5 },
    metrics: {
      submitted: submittedCount,
      underReview: underReview.ok ? reviewIssues.length : null,
      accepted: acceptedCount,
      approvalRate: submittedCount !== null && acceptedCount !== null ? submittedCount ? round((acceptedCount / submittedCount) * 100) : 0 : null,
      completionRate: startedCount !== null && completedParticipants !== null ? startedCount ? round((completedParticipants / startedCount) * 100) : null : null,
      started: startedCount,
      dropoffs: startedCount !== null && completedParticipants !== null ? startedCount - completedParticipants : null,
      uniqueBuilders,
      distinctProjects,
      repeatBuilders: walletCounts ? [...walletCounts.values()].filter((value) => value > 1).length : null,
      repeatProjects: projectCounts ? [...projectCounts.values()].filter((value) => value > 1).length : null,
      acceptedPerBuilder: accepted.ok && uniqueBuilders ? round(parsedAccepted.length / uniqueBuilders) : accepted.ok ? 0 : null,
      averageReviewHours: accepted.ok && reviewHours.length ? round(reviewHours.reduce((sum, value) => sum + value, 0) / reviewHours.length) : null,
      medianReviewHours: percentile(sortedReviewHours, 0.5),
      p90ReviewHours: percentile(sortedReviewHours, 0.9),
      feedbackCount: feedback.ok ? feedbackItems.length : null,
      privateFeedbackRequests,
      usefulRate: feedback.ok ? feedbackItems.length ? round((countFeedback("A revisão foi útil\\?", "sim") / feedbackItems.length) * 100) : null : null,
      appliedRate: feedback.ok ? feedbackItems.length ? round((countFeedback("Você aplicou a recomendação principal\\?", "sim") / feedbackItems.length) * 100) : null : null,
      repeatIntentRate: feedback.ok ? feedbackItems.length ? round((countFeedback("Você faria outro ciclo nas próximas quatro semanas\\?", "sim") / feedbackItems.length) * 100) : null : null,
      willingnessToPay: feedback.ok && feedbackItems.length ? countFeedback("Você pagaria por uma revisão individual\\?", "sim") : null,
    },
    rubric: rubricCounts,
    rubricVersion: 1,
    targets: { participants: 10, submissions: 7, repeatBuilders: 5, willingnessToPay: 3, reviewSlaHours: REVIEW_SLA_HOURS },
    startedCohort,
    reviewQueue,
    builders,
  };
}
