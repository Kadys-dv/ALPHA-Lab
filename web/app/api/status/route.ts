import { NextResponse } from "next/server";
import { parseSubmission } from "@/lib/validation";

const REPO = "Kadys-dv/ALPHA-Lab";

type SearchItem = { number: number; body?: string | null };
type SearchResult = { total_count: number; items: SearchItem[] };

async function search(label: string, perPage = 1): Promise<SearchResult> {
  const q = encodeURIComponent(`repo:${REPO} is:issue label:${label} sort:updated-desc`);
  const response = await fetch(
    `https://api.github.com/search/issues?q=${q}&per_page=${perPage}`,
    {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 300 },
    },
  );

  if (!response.ok) return { total_count: 0, items: [] };
  return response.json() as Promise<SearchResult>;
}

export async function GET() {
  const [submitted, underReview, accepted] = await Promise.all([
    search("submission"),
    search("under-review"),
    search("accepted", 100),
  ]);

  const parsedAccepted = accepted.items.flatMap((issue) => {
    const parsed = parseSubmission(issue.body ?? "");
    return parsed ? [{ issue: issue.number, ...parsed }] : [];
  });

  const builders = parsedAccepted.slice(0, 12).map((builder) => ({
    issue: builder.issue,
    repoUrl: builder.repoUrl,
    evidenceUrl: builder.evidenceUrl,
    wallet: `${builder.wallet.slice(0, 6)}…${builder.wallet.slice(-4)}`,
    status: "accepted",
  }));

  const uniqueBuilders = new Set(parsedAccepted.map((builder) => builder.wallet.toLowerCase())).size;
  const distinctProjects = new Set(parsedAccepted.map((builder) => builder.repoUrl.toLowerCase())).size;
  const approvalRate = submitted.total_count
    ? Math.round((accepted.total_count / submitted.total_count) * 1000) / 10
    : 0;

  return NextResponse.json(
    {
      metrics: {
        submitted: submitted.total_count,
        underReview: underReview.total_count,
        accepted: accepted.total_count,
        approvalRate,
        uniqueBuilders,
        distinctProjects,
      },
      builders,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}
