import "server-only";
import { parseSubmission } from "@/lib/validation";

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
  status: "accepted";
};

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
    status: "accepted",
  };
}
