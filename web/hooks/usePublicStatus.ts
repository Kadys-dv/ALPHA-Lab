"use client";

import { useEffect, useState } from "react";

export type PublicStatus = {
  metrics: {
    submitted: number;
    underReview: number;
    accepted: number;
    approvalRate: number;
    uniqueBuilders: number;
    distinctProjects: number;
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
  metrics: {
    submitted: 0,
    underReview: 0,
    accepted: 0,
    approvalRate: 0,
    uniqueBuilders: 0,
    distinctProjects: 0,
  },
  builders: [],
};

export function usePublicStatus() {
  const [status, setStatus] = useState<PublicStatus>(EMPTY_STATUS);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/status", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((value) => {
        if (value) setStatus(value as PublicStatus);
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, []);

  return status;
}
