export type Submission = { repoUrl: string; wallet: string };
export function normalizeGitHubRepoUrl(input: string): string | null {
  try {
    const url = new URL(input.trim());
    if (url.protocol !== "https:" || url.hostname !== "github.com") return null;
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length !== 2) return null;
    const [owner, repo] = parts;
    if (!/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(repo)) return null;
    return `https://github.com/${owner}/${repo.replace(/\.git$/, "")}`;
  } catch { return null; }
}
export function isEvmAddress(input: string): boolean { return /^0x[a-fA-F0-9]{40}$/.test(input.trim()); }
export function buildIssueUrl({ repoUrl, wallet }: Submission): string {
  const safeRepo = normalizeGitHubRepoUrl(repoUrl);
  if (!safeRepo || !isEvmAddress(wallet)) throw new Error("Invalid submission");
  const title = "[ALPHA Builders] README review submission";
  const body = ["## ALPHA Builders submission","",`Repository: ${safeRepo}`,`Wallet: ${wallet.trim()}`,"","Status: submitted","","> Public testnet submission. Do not include private keys, seed phrases, emails or private data."].join("\n");
  const params = new URLSearchParams({ title, body });
  return `https://github.com/Kadys-dv/ALPHA-Lab/issues/new?${params.toString()}`;
}
export function parseSubmission(body: string): Submission | null {
  const repo = body.match(/^Repository:\s*(https:\/\/github\.com\/[^\s/]+\/[^\s/]+)\s*$/im)?.[1]
    ?? body.match(/### Repository\s+\n\s*(https:\/\/github\.com\/[^\s/]+\/[^\s/]+)/im)?.[1];
  const wallet = body.match(/^Wallet:\s*(0x[a-fA-F0-9]{40})\s*$/im)?.[1]
    ?? body.match(/### Wallet\s+\n\s*(0x[a-fA-F0-9]{40})/im)?.[1];
  if (!repo || !wallet) return null;
  const normalized = normalizeGitHubRepoUrl(repo);
  return normalized && isEvmAddress(wallet) ? { repoUrl: normalized, wallet } : null;
}
