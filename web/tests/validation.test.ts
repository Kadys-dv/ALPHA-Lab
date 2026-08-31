import { describe, expect, it } from "vitest";
import {
  buildIssueUrl,
  isEvmAddress,
  normalizeGitHubEvidenceUrl,
  normalizeGitHubRepoUrl,
  parseSubmission,
} from "@/lib/validation";

describe("submission validation", () => {
  it("accepts GitHub repo URL", () =>
    expect(normalizeGitHubRepoUrl("https://github.com/Kadys-dv/ALPHA-Lab")).toBe(
      "https://github.com/Kadys-dv/ALPHA-Lab",
    ));

  it("accepts GitHub pull request evidence", () =>
    expect(normalizeGitHubEvidenceUrl("https://github.com/Kadys-dv/ALPHA-Lab/pull/27")).toBe(
      "https://github.com/Kadys-dv/ALPHA-Lab/pull/27",
    ));

  it("derives repository from pull request evidence", () =>
    expect(normalizeGitHubRepoUrl("https://github.com/Kadys-dv/ALPHA-Lab/pull/27")).toBe(
      "https://github.com/Kadys-dv/ALPHA-Lab",
    ));

  it("rejects unsupported GitHub paths", () =>
    expect(normalizeGitHubEvidenceUrl("https://github.com/Kadys-dv/ALPHA-Lab/issues/1")).toBeNull());

  it("rejects other hosts", () =>
    expect(normalizeGitHubRepoUrl("https://example.com/a/b")).toBeNull());

  it("validates EVM addresses", () =>
    expect(isEvmAddress("0x1111111111111111111111111111111111111111")).toBe(true));

  it("rejects short EVM addresses", () => expect(isEvmAddress("0x123")).toBe(false));

  it("builds safe issue URL from pull request evidence", () => {
    const url = buildIssueUrl({
      evidenceUrl: "https://github.com/Kadys-dv/ALPHA-Lab/pull/27",
      wallet: "0x1111111111111111111111111111111111111111",
    });
    expect(url).toContain("issues/new?");
    expect(decodeURIComponent(url)).toContain("Evidence: https://github.com/Kadys-dv/ALPHA-Lab/pull/27");
  });

  it("parses current submission format", () => {
    const parsed = parseSubmission(
      "Repository: https://github.com/Kadys-dv/ALPHA-Lab\nEvidence: https://github.com/Kadys-dv/ALPHA-Lab/pull/27\nWallet: 0x1111111111111111111111111111111111111111",
    );
    expect(parsed?.repoUrl).toBe("https://github.com/Kadys-dv/ALPHA-Lab");
    expect(parsed?.evidenceUrl).toBe("https://github.com/Kadys-dv/ALPHA-Lab/pull/27");
  });

  it("keeps legacy submissions compatible", () => {
    const parsed = parseSubmission(
      "Repository: https://github.com/Kadys-dv/ALPHA-Lab\nWallet: 0x1111111111111111111111111111111111111111",
    );
    expect(parsed?.evidenceUrl).toBe("https://github.com/Kadys-dv/ALPHA-Lab");
  });
});
