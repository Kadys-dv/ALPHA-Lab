import { randomBytes, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { recoverMessageAddress } from "viem";
import { buildWalletProofMessage, isEvmAddress, normalizeGitHubEvidenceUrl } from "@/lib/validation";
import contract from "@/lib/submission-contract.json";

const NONCE_TTL_MS = 5 * 60 * 1000;
const RATE_WINDOW_MS = 60 * 1000;
const RATE_LIMIT = 20;
const MAX_PAYLOAD_BYTES = 16 * 1024;
type NonceRecord = { createdAt: string; expiresAt: number };
type RateRecord = { count: number; resetAt: number };
type KvBinding = { get(key: string, type?: "json"): Promise<NonceRecord | null>; put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>; delete(key: string): Promise<void> };
const nonces = new Map<string, NonceRecord>();
const nonceLocks = new Map<string, Promise<void>>();
const rateLimits = new Map<string, RateRecord>();
const binding = (globalThis as unknown as { ALPHA_NONCES?: KvBinding }).ALPHA_NONCES;

async function prune() {
  const now = Date.now();
  for (const [nonce, value] of nonces) if (value.expiresAt <= now) nonces.delete(nonce);
  for (const [key, value] of rateLimits) if (value.resetAt <= now) rateLimits.delete(key);
}

function requestId(): string {
  return randomUUID();
}

function errorResponse(error: string, status = 400, id = requestId()) {
  return NextResponse.json({ ok: false, error, requestId: id }, { status, headers: { "X-Request-Id": id, "Cache-Control": "no-store" } });
}

function clientAddress(request: Request): string | null {
  const forwarded = request.headers.get("CF-Connecting-IP") ?? request.headers.get("X-Forwarded-For")?.split(",")[0];
  const value = forwarded?.trim();
  return value ? value : null;
}

function checkRateLimit(request: Request): Response | null {
  const address = clientAddress(request);
  if (!address) return null;
  const now = Date.now();
  const current = rateLimits.get(address);
  const record = !current || current.resetAt <= now
    ? { count: 1, resetAt: now + RATE_WINDOW_MS }
    : { count: current.count + 1, resetAt: current.resetAt };
  rateLimits.set(address, record);
  if (record.count <= RATE_LIMIT) return null;
  const retryAfter = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
  const id = request.headers.get("X-Request-Id") ?? requestId();
  return NextResponse.json(
    { ok: false, error: "rate_limited", requestId: id },
    { status: 429, headers: { "X-Request-Id": id, "Cache-Control": "no-store", "Retry-After": String(retryAfter) } },
  );
}

async function withNonceLock<T>(nonce: string, operation: () => Promise<T>): Promise<T> {
  const previous = nonceLocks.get(nonce) ?? Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>((resolve) => { release = resolve; });
  nonceLocks.set(nonce, current);
  await previous;
  try {
    return await operation();
  } finally {
    release();
    if (nonceLocks.get(nonce) === current) nonceLocks.delete(nonce);
  }
}

export async function GET() {
  await prune();
  const id = requestId();
  const nonce = `0x${randomBytes(32).toString("hex")}`;
  const createdAt = new Date().toISOString();
  const expiresAt = Date.now() + NONCE_TTL_MS;
  const record = { createdAt, expiresAt };
  if (binding) await binding.put(`nonce:${nonce}`, JSON.stringify(record), { expirationTtl: Math.ceil(NONCE_TTL_MS / 1000) });
  else nonces.set(nonce, record);
  return NextResponse.json(
    { nonce, createdAt, expiresAt: new Date(expiresAt).toISOString(), requestId: id },
    { headers: { "Cache-Control": "no-store", "X-Request-Id": id } },
  );
}

export async function POST(request: Request) {
  await prune();
  const limited = checkRateLimit(request);
  if (limited) return limited;
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_PAYLOAD_BYTES) return errorResponse("payload_too_large", 413);
  const id = request.headers.get("X-Request-Id") ?? requestId();
  let input: unknown;
  try { input = await request.json(); } catch { return errorResponse("invalid_json", 400, id); }
  if (typeof input !== "object" || input === null) return errorResponse("invalid_payload", 400, id);
  const { evidenceUrl, wallet, nonce, proofCreatedAt, signature } = input as Record<string, unknown>;
  const evidence = typeof evidenceUrl === "string" ? normalizeGitHubEvidenceUrl(evidenceUrl) : null;
  if (!evidence || typeof wallet !== "string" || !isEvmAddress(wallet) ||
      typeof nonce !== "string" || !new RegExp(contract.noncePattern).test(nonce) ||
      typeof proofCreatedAt !== "string" || typeof signature !== "string" ||
      !new RegExp(contract.signaturePattern).test(signature)) return errorResponse("invalid_proof", 400, id);
  return withNonceLock(nonce, async () => {
    const issued = binding ? await binding.get(`nonce:${nonce}`, "json") : nonces.get(nonce);
    if (!issued || issued.createdAt !== proofCreatedAt || issued.expiresAt <= Date.now()) {
      if (binding) await binding.delete(`nonce:${nonce}`); else nonces.delete(nonce);
      return errorResponse("nonce_expired_or_unknown", 401, id);
    }
    try {
      const message = buildWalletProofMessage(evidence, wallet, nonce, proofCreatedAt);
      const recoveredAddress = await recoverMessageAddress({
        message,
        signature: signature as `0x${string}`,
      });
      if (recoveredAddress.toLowerCase() !== wallet.trim().toLowerCase()) {
        return errorResponse("signature_address_mismatch", 401, id);
      }
    } catch {
      return errorResponse("invalid_signature", 401, id);
    }
    if (binding) await binding.delete(`nonce:${nonce}`); else nonces.delete(nonce);
    return NextResponse.json(
      { ok: true, wallet: wallet.trim().toLowerCase(), evidenceUrl: evidence, requestId: id },
      { headers: { "Cache-Control": "no-store", "X-Request-Id": id } },
    );
  });
}
