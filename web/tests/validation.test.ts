import { describe, expect, it } from "vitest";
import { buildIssueUrl, isEvmAddress, normalizeGitHubRepoUrl, parseSubmission } from "@/lib/validation";
describe("submission validation",()=>{
 it("accepts GitHub repo URL",()=>expect(normalizeGitHubRepoUrl("https://github.com/Kadys-dv/ALPHA-Lab")).toBe("https://github.com/Kadys-dv/ALPHA-Lab"));
 it("rejects other hosts",()=>expect(normalizeGitHubRepoUrl("https://example.com/a/b")).toBeNull());
 it("validates EVM addresses",()=>expect(isEvmAddress("0x1111111111111111111111111111111111111111")).toBe(true));
 it("rejects short EVM addresses",()=>expect(isEvmAddress("0x123")).toBe(false));
 it("builds safe issue URL",()=>expect(buildIssueUrl({repoUrl:"https://github.com/Kadys-dv/ALPHA-Lab",wallet:"0x1111111111111111111111111111111111111111"})).toContain("issues/new?"));
 it("parses submission",()=>expect(parseSubmission("Repository: https://github.com/Kadys-dv/ALPHA-Lab\nWallet: 0x1111111111111111111111111111111111111111")).not.toBeNull());
});
