export type Submission = {
  repoUrl: string;
  evidenceUrl: string;
  wallet: string;
  nonce?: string;
  signature?: string;
};

type SubmissionInput = {
  repoUrl?: string;
  evidenceUrl?: string;
  wallet: string;
  nonce: string;
  signature: string;
};

const SEGMENT = /^[A-Za-z0-9_.-]+$/;

export function normalizeGitHubEvidenceUrl(input: string): string | null {
  try {
    const url = new URL(input.trim());
    if (url.protocol !== "https:" || url.hostname !== "github.com") return null;

    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length !== 2 && parts.length !== 4) return null;

    const owner = parts[0];
    const repo = parts[1]?.replace(/\.git$/, "");
    if (!owner || !repo || !SEGMENT.test(owner) || !SEGMENT.test(repo)) return null;

    const repoUrl = `https://github.com/${owner}/${repo}`;
    if (parts.length === 2) return repoUrl;

    if (parts[2] !== "pull" || !/^\d+$/.test(parts[3] ?? "")) return null;
    return `${repoUrl}/pull/${parts[3]}`;
  } catch {
    return null;
  }
}

export function normalizeGitHubRepoUrl(input: string): string | null {
  const evidence = normalizeGitHubEvidenceUrl(input);
  if (!evidence) return null;
  const url = new URL(evidence);
  const [owner, repo] = url.pathname.split("/").filter(Boolean);
  return owner && repo ? `https://github.com/${owner}/${repo}` : null;
}

export function isEvmAddress(input: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(input.trim());
}

export function buildWalletProofMessage(evidenceUrl: string, wallet: string, nonce: string): string {
  const evidence = normalizeGitHubEvidenceUrl(evidenceUrl);
  if (!evidence || !isEvmAddress(wallet) || !/^0x[a-fA-F0-9]{64}$/.test(nonce)) throw new Error("Invalid wallet proof");
  return `ALPHA Builders wallet proof\nEvidence: ${evidence}\nWallet: ${wallet.toLowerCase()}\nNonce: ${nonce}`;
}

export function buildIssueUrl({ repoUrl, evidenceUrl, wallet, nonce, signature }: SubmissionInput): string {
  const safeEvidence = normalizeGitHubEvidenceUrl(evidenceUrl ?? repoUrl ?? "");
  const safeRepo = safeEvidence ? normalizeGitHubRepoUrl(safeEvidence) : null;
  if (!safeRepo || !safeEvidence || !isEvmAddress(wallet) || !/^0x[a-fA-F0-9]{64}$/.test(nonce) || !/^0x[a-fA-F0-9]{130}$/.test(signature)) throw new Error("Invalid submission");

  const title = "[ALPHA Builders] README review submission";
  const body = [
    "## ALPHA Builders submission",
    "",
    `Repository: ${safeRepo}`,
    `Evidence: ${safeEvidence}`,
    `Wallet: ${wallet.trim()}`,
    `Nonce: ${nonce}`,
    `Signature: ${signature}`,
    "",
    "Status: submitted",
    "",
    "> Public testnet submission. Do not include private keys, seed phrases, emails or private data.",
  ].join("\n");
  const params = new URLSearchParams({ title, body });
  return `https://github.com/Kadys-dv/ALPHA-Lab/issues/new?${params.toString()}`;
}

export function parseSubmission(body: string): Submission | null {
  const repo =
    body.match(/^Repository:\s*(https:\/\/github\.com\/[^\s/]+\/[^\s/]+)\s*$/im)?.[1] ??
    body.match(/### Repository\s+\n\s*(https:\/\/github\.com\/[^\s/]+\/[^\s/]+)/im)?.[1];
  const evidence = body.match(/^Evidence:\s*(https:\/\/github\.com\/\S+)\s*$/im)?.[1];
  const wallet =
    body.match(/^Wallet:\s*(0x[a-fA-F0-9]{40})\s*$/im)?.[1] ??
    body.match(/### Wallet\s+\n\s*(0x[a-fA-F0-9]{40})/im)?.[1];
  const nonce = body.match(/^Nonce:\s*(0x[a-fA-F0-9]{64})\s*$/im)?.[1] ?? body.match(/### Nonce\s+\n\s*(0x[a-fA-F0-9]{64})/im)?.[1];
  const signature = body.match(/^Signature:\s*(0x[a-fA-F0-9]{130})\s*$/im)?.[1] ?? body.match(/### Signature\s+\n\s*(0x[a-fA-F0-9]{130})/im)?.[1];

  if (!repo || !wallet) return null;

  const normalizedRepo = normalizeGitHubRepoUrl(repo);
  const normalizedEvidence = normalizeGitHubEvidenceUrl(evidence ?? repo);
  if (!normalizedRepo || !normalizedEvidence || !isEvmAddress(wallet)) return null;
  if (normalizeGitHubRepoUrl(normalizedEvidence) !== normalizedRepo) return null;

  return { repoUrl: normalizedRepo, evidenceUrl: normalizedEvidence, wallet, nonce, signature };
}
