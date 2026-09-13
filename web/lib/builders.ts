import { parseSubmission } from "@/lib/validation";
import { acceptedAt } from "@/lib/public-status";

const REPO = "Kadys-dv/ALPHA-Lab";

export type AcceptedBuilder = {
  issue: number;
  title: string;
  repoUrl: string;
  evidenceUrl: string;
  wallet: string;
  issueUrl: string;
  createdAt: string;
  updatedAt: string;
  acceptedAt: string | null;
  review: ReviewRecord | null;
  status: "accepted";
};

export type ReviewRecord = {
  criteria: Record<"context" | "installation" | "decisions" | "tests" | "demo", string>;
  result: string;
  recommendation: string;
  reviewer: string;
};

export function parseReviewRecord(body: string | null | undefined): ReviewRecord | null {
  const serialized = body?.match(/<!-- alpha-review-record\s*\n([\s\S]*?)\n-->/)?.[1];
  if (!serialized) return null;
  try {
    const value = JSON.parse(serialized) as Partial<ReviewRecord>;
    const keys = ["context", "installation", "decisions", "tests", "demo"] as const;
    if (!value.criteria || keys.some((key) => typeof value.criteria?.[key] !== "string")) return null;
    if (typeof value.result !== "string" || typeof value.recommendation !== "string" || typeof value.reviewer !== "string") return null;
    return value as ReviewRecord;
  } catch {
    return null;
  }
}

type GitHubIssue = {
  number: number;
  title: string;
  body?: string | null;
  html_url: string;
  created_at: string;
  updated_at: string;
  labels: Array<string | { name?: string | null }>;
};

function hasAcceptedLabel(labels: GitHubIssue["labels"]) {
  return labels.some((label) =>
    typeof label === "string" ? label === "accepted" : label.name === "accepted",
  );
}

export async function getAcceptedBuilder(issue: number): Promise<AcceptedBuilder | null> {
  if (!Number.isSafeInteger(issue) || issue <= 0) return null;

  const response = await fetch(`https://api.github.com/repos/${REPO}/issues/${issue}`, {
    headers: { Accept: "application/vnd.github+json" },
    next: { revalidate: 300 },
  });

  if (!response.ok) return null;
  const data = (await response.json()) as GitHubIssue;
  if (!hasAcceptedLabel(data.labels)) return null;

  const submission = parseSubmission(data.body ?? "");
  if (!submission) return null;

  return {
    issue: data.number,
    title: data.title,
    repoUrl: submission.repoUrl,
    evidenceUrl: submission.evidenceUrl,
    wallet: `${submission.wallet.slice(0, 6)}…${submission.wallet.slice(-4)}`,
    issueUrl: data.html_url,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    acceptedAt: acceptedAt(data.body),
    review: parseReviewRecord(data.body),
    status: "accepted",
  };
}
