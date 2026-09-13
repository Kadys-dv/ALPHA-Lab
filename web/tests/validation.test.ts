import { describe, expect, it } from "vitest";
import {
  buildIssueUrl,
  buildCycleId,
  buildWalletProofMessage,
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

  it("binds the wallet proof to normalized evidence, address and nonce", () => {
    const message = buildWalletProofMessage("https://github.com/Kadys-dv/ALPHA-Lab/pull/27", "0x1111111111111111111111111111111111111111", `0x${"2".repeat(64)}`, "2026-09-13T12:00:00.000Z");
    expect(message).toContain("Evidence: https://github.com/Kadys-dv/ALPHA-Lab/pull/27");
    expect(message).toContain(`Nonce: 0x${"2".repeat(64)}`);
    expect(message).toContain("Created At: 2026-09-13T12:00:00.000Z");
  });

  it("builds stable cycle identifiers from random bytes", () =>
    expect(buildCycleId(new Uint8Array([0xab, 0xcd, 0xef, 0x12, 0x34, 0x56]))).toBe("alpha-abcdef123456"));

  it("rejects short EVM addresses", () => expect(isEvmAddress("0x123")).toBe(false));

  it("builds safe issue URL from pull request evidence", () => {
    const url = buildIssueUrl({
      evidenceUrl: "https://github.com/Kadys-dv/ALPHA-Lab/pull/27",
      wallet: "0x1111111111111111111111111111111111111111",
      cycleId: "alpha-abcdef123456",
      nonce: `0x${"2".repeat(64)}`,
      proofCreatedAt: "2026-09-13T12:00:00.000Z",
      signature: `0x${"3".repeat(130)}`,
    });
    const issueUrl = new URL(url);
    expect(url).toContain("issues/new?");
    expect(issueUrl.searchParams.get("body")).toContain(
      "Evidence: https://github.com/Kadys-dv/ALPHA-Lab/pull/27",
    );
    expect(issueUrl.searchParams.get("body")).toContain("Cycle ID: alpha-abcdef123456");
  });

  it("parses current submission format", () => {
    const parsed = parseSubmission(
      `Cycle ID: alpha-abcdef123456\nRepository: https://github.com/Kadys-dv/ALPHA-Lab\nEvidence: https://github.com/Kadys-dv/ALPHA-Lab/pull/27\nWallet: 0x1111111111111111111111111111111111111111\nNonce: 0x${"2".repeat(64)}\nProof Created At: 2026-09-13T12:00:00.000Z\nSignature: 0x${"3".repeat(130)}`,
    );
    expect(parsed?.repoUrl).toBe("https://github.com/Kadys-dv/ALPHA-Lab");
    expect(parsed?.evidenceUrl).toBe("https://github.com/Kadys-dv/ALPHA-Lab/pull/27");
    expect(parsed?.cycleId).toBe("alpha-abcdef123456");
    expect(parsed?.proofCreatedAt).toBe("2026-09-13T12:00:00.000Z");
  });

  it("keeps legacy submissions compatible", () => {
    const parsed = parseSubmission(
      "Repository: https://github.com/Kadys-dv/ALPHA-Lab\nWallet: 0x1111111111111111111111111111111111111111",
    );
    expect(parsed?.evidenceUrl).toBe("https://github.com/Kadys-dv/ALPHA-Lab");
  });
});
