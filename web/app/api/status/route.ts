import { NextResponse } from "next/server";
import { parseSubmission } from "@/lib/validation";

const REPO = "Kadys-dv/ALPHA-Lab";

type SearchItem = {
  number: number;
  body?: string | null;
  created_at?: string;
  updated_at?: string;
};

type SearchResult = {
  ok: boolean;
  total_count: number | null;
  items: SearchItem[];
  error?: string;
};

async function search(label: string, perPage = 1): Promise<SearchResult> {
  const q = encodeURIComponent(`repo:${REPO} is:issue label:${label} sort:updated-desc`);

  try {
    const response = await fetch(
      `https://api.github.com/search/issues?q=${q}&per_page=${perPage}`,
      {
        headers: { Accept: "application/vnd.github+json" },
        next: { revalidate: 300 },
      },
    );

    if (!response.ok) {
      return {
        ok: false,
        total_count: null,
        items: [],
        error: `github_${response.status}`,
      };
    }

    const data = (await response.json()) as { total_count: number; items: SearchItem[] };
    return { ok: true, total_count: data.total_count, items: data.items };
  } catch {
    return { ok: false, total_count: null, items: [], error: "github_unreachable" };
  }
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

export async function GET() {
  const checkedAt = new Date().toISOString();
  const [submitted, underReview, accepted] = await Promise.all([
    search("submission"),
    search("under-review"),
    search("accepted", 100),
  ]);

  const parsedAccepted = accepted.ok
    ? accepted.items.flatMap((issue) => {
        const parsed = parseSubmission(issue.body ?? "");
        return parsed
          ? [
              {
                issue: issue.number,
                createdAt: issue.created_at ?? null,
                updatedAt: issue.updated_at ?? null,
                ...parsed,
              },
            ]
          : [];
      })
    : [];

  const builders = parsedAccepted.slice(0, 12).map((builder) => ({
    issue: builder.issue,
    repoUrl: builder.repoUrl,
    evidenceUrl: builder.evidenceUrl,
    wallet: `${builder.wallet.slice(0, 6)}…${builder.wallet.slice(-4)}`,
    status: "accepted",
  }));

  const uniqueBuilders = accepted.ok
    ? new Set(parsedAccepted.map((builder) => builder.wallet.toLowerCase())).size
    : null;
  const distinctProjects = accepted.ok
    ? new Set(parsedAccepted.map((builder) => builder.repoUrl.toLowerCase())).size
    : null;

  const walletCounts = accepted.ok
    ? parsedAccepted.reduce<Map<string, number>>((counts, builder) => {
        const wallet = builder.wallet.toLowerCase();
        counts.set(wallet, (counts.get(wallet) ?? 0) + 1);
        return counts;
      }, new Map())
    : null;

  const repeatBuilders = walletCounts
    ? [...walletCounts.values()].filter((count) => count > 1).length
    : null;

  const approvalRate =
    submitted.ok && accepted.ok && submitted.total_count
      ? round(((accepted.total_count ?? 0) / submitted.total_count) * 100)
      : submitted.ok && accepted.ok
        ? 0
        : null;

  const acceptedPerBuilder =
    accepted.ok && uniqueBuilders
      ? round(parsedAccepted.length / uniqueBuilders)
      : accepted.ok
        ? 0
        : null;

  const successfulSources = [submitted.ok, underReview.ok, accepted.ok].filter(Boolean).length;
  const state = successfulSources === 3 ? "ok" : successfulSources === 0 ? "unavailable" : "partial";

  return NextResponse.json(
    {
      state,
      checkedAt,
      metrics: {
        submitted: submitted.total_count,
        underReview: underReview.total_count,
        accepted: accepted.total_count,
        approvalRate,
        uniqueBuilders,
        distinctProjects,
        repeatBuilders,
        acceptedPerBuilder,
      },
      builders,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "X-ALPHA-Status": state,
      },
    },
  );
}
