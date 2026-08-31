"use client";

import { useEffect, useState } from "react";

export type MetricValue = number | null;
export type PublicStatusState = "loading" | "ok" | "partial" | "unavailable";

export type PublicStatus = {
  state: PublicStatusState;
  checkedAt: string | null;
  metrics: {
    submitted: MetricValue;
    underReview: MetricValue;
    accepted: MetricValue;
    approvalRate: MetricValue;
    uniqueBuilders: MetricValue;
    distinctProjects: MetricValue;
    repeatBuilders: MetricValue;
    acceptedPerBuilder: MetricValue;
  };
  builders: Array<{
    issue: number;
    repoUrl: string;
    evidenceUrl: string;
    wallet: string;
    status: string;
  }>;
};

const EMPTY_STATUS: PublicStatus = {
  state: "loading",
  checkedAt: null,
  metrics: {
    submitted: null,
    underReview: null,
    accepted: null,
    approvalRate: null,
    uniqueBuilders: null,
    distinctProjects: null,
    repeatBuilders: null,
    acceptedPerBuilder: null,
  },
  builders: [],
};

export function usePublicStatus() {
  const [status, setStatus] = useState<PublicStatus>(EMPTY_STATUS);

  useEffect(() => {
    const controller = new AbortController();

    void fetch("/api/status", { signal: controller.signal })
      .then(async (response) => {
        const value = (await response.json().catch(() => null)) as PublicStatus | null;
        if (value?.state) return value;
        return null;
      })
      .then((value) => {
        if (value) {
          setStatus(value);
          return;
        }
        setStatus((current) => ({ ...current, state: "unavailable" }));
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setStatus((current) => ({ ...current, state: "unavailable" }));
      });

    return () => controller.abort();
  }, []);

  return status;
}
