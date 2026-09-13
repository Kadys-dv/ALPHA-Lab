import contract from "./submission-contract.json";

export type Submission = {
  repoUrl: string;
  evidenceUrl: string;
  wallet: string;
  cycleId?: string;
  nonce?: string;
  proofCreatedAt?: string;
  signature?: string;
};

type SubmissionInput = {
  repoUrl?: string;
  evidenceUrl?: string;
  wallet: string;
  cycleId: string;
  nonce: string;
  proofCreatedAt: string;
  signature: string;
};

const SEGMENT = /^[A-Za-z0-9_.-]+$/;
const CYCLE_ID = new RegExp(contract.cycleIdPattern);
const WALLET = new RegExp(contract.walletPattern);
const NONCE = new RegExp(contract.noncePattern);
const SIGNATURE = new RegExp(contract.signaturePattern);

export function normalizeGitHubEvidenceUrl(input: string): string | null {
  try {
    const url = new URL(input.trim());
    if (url.protocol !== "https:" || url.hostname !== contract.githubHost) return null;

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
  return WALLET.test(input.trim());
}

export function buildCycleId(bytes: Uint8Array): string {
  return `alpha-${Array.from(bytes.slice(0, 6), (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

export function isCycleId(input: string): boolean {
  return CYCLE_ID.test(input.trim());
}

export function buildWalletProofMessage(evidenceUrl: string, wallet: string, nonce: string, proofCreatedAt: string): string {
  const evidence = normalizeGitHubEvidenceUrl(evidenceUrl);
  if (!evidence || !isEvmAddress(wallet) || !NONCE.test(nonce) || Number.isNaN(Date.parse(proofCreatedAt))) throw new Error("Invalid wallet proof");
  return `${contract.proofMessagePrefix}\nEvidence: ${evidence}\nWallet: ${wallet.toLowerCase()}\nNonce: ${nonce}\nCreated At: ${proofCreatedAt}`;
}

export function buildIssueUrl({ repoUrl, evidenceUrl, wallet, cycleId, nonce, proofCreatedAt, signature }: SubmissionInput): string {
  const safeEvidence = normalizeGitHubEvidenceUrl(evidenceUrl ?? repoUrl ?? "");
  const safeRepo = safeEvidence ? normalizeGitHubRepoUrl(safeEvidence) : null;
  if (!safeRepo || !safeEvidence || !isEvmAddress(wallet) || !isCycleId(cycleId) || !NONCE.test(nonce) || Number.isNaN(Date.parse(proofCreatedAt)) || !SIGNATURE.test(signature)) throw new Error("Invalid submission");

  const title = contract.issueTitle;
  const body = [
    "## ALPHA Builders submission",
    "",
    `Cycle ID: ${cycleId}`,
    `Repository: ${safeRepo}`,
    `Evidence: ${safeEvidence}`,
    `Wallet: ${wallet.trim()}`,
    `Nonce: ${nonce}`,
    `Proof Created At: ${proofCreatedAt}`,
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
  const cycleId = body.match(new RegExp(`^Cycle ID:\\s*(${contract.cycleIdPattern.slice(1, -1)})\\s*$`, "im"))?.[1] ?? body.match(new RegExp(`### Cycle ID\\s+\\n\\s*(${contract.cycleIdPattern.slice(1, -1)})`, "im"))?.[1];
  const nonce = body.match(new RegExp(`^Nonce:\\s*(${contract.noncePattern.slice(1, -1)})\\s*$`, "im"))?.[1] ?? body.match(new RegExp(`### Nonce\\s+\\n\\s*(${contract.noncePattern.slice(1, -1)})`, "im"))?.[1];
  const proofCreatedAt = body.match(/^Proof Created At:\s*([^\n]+)\s*$/im)?.[1]?.trim() ?? body.match(/### Proof Created At\s+\n\s*([^\n]+)/im)?.[1]?.trim();
  const signature = body.match(new RegExp(`^Signature:\\s*(${contract.signaturePattern.slice(1, -1)})\\s*$`, "im"))?.[1] ?? body.match(new RegExp(`### Signature\\s+\\n\\s*(${contract.signaturePattern.slice(1, -1)})`, "im"))?.[1];

  if (!repo || !wallet) return null;

  const normalizedRepo = normalizeGitHubRepoUrl(repo);
  const normalizedEvidence = normalizeGitHubEvidenceUrl(evidence ?? repo);
  if (!normalizedRepo || !normalizedEvidence || !isEvmAddress(wallet)) return null;
  if (normalizeGitHubRepoUrl(normalizedEvidence) !== normalizedRepo) return null;

  return { repoUrl: normalizedRepo, evidenceUrl: normalizedEvidence, wallet, cycleId, nonce, proofCreatedAt, signature };
}
