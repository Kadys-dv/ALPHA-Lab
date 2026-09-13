import { describe, expect, it } from "vitest";
import { privateKeyToAccount } from "viem/accounts";
import { GET, POST } from "@/app/api/wallet-proof/route";
import { buildWalletProofMessage } from "@/lib/validation";

const account = privateKeyToAccount(`0x${"1".repeat(64)}`);
const evidenceUrl = "https://github.com/Kadys-dv/ALPHA-Lab/pull/27";

describe("wallet proof route", () => {
  it("verifies a signature and rejects replay", async () => {
    const challenge = await (await GET()).json();
    const message = buildWalletProofMessage(evidenceUrl, account.address, challenge.nonce, challenge.createdAt);
    const signature = await account.signMessage({ message });
    const request = () => new Request("http://localhost/api/wallet-proof", {
      method: "POST",
      body: JSON.stringify({ evidenceUrl, wallet: account.address, ...challenge, proofCreatedAt: challenge.createdAt, signature }),
      headers: { "content-type": "application/json", "X-Request-Id": challenge.requestId },
    });
    const verified = await POST(request());
    expect(verified.status).toBe(200);
    expect(verified.headers.get("X-Request-Id")).toBe(challenge.requestId);
    const replay = await POST(request());
    expect(replay.status).toBe(401);
    expect(replay.headers.get("X-Request-Id")).toBeTruthy();
  });

  it("rejects a signature for another wallet", async () => {
    const challenge = await (await GET()).json();
    const message = buildWalletProofMessage(evidenceUrl, account.address, challenge.nonce, challenge.createdAt);
    const signature = await account.signMessage({ message });
    const response = await POST(new Request("http://localhost/api/wallet-proof", {
      method: "POST",
      body: JSON.stringify({
        evidenceUrl, wallet: `0x${"2".repeat(40)}`, nonce: challenge.nonce,
        proofCreatedAt: challenge.createdAt, signature,
      }),
      headers: { "content-type": "application/json" },
    }));
    expect(response.status).toBe(401);
  });

  it("does not consume a nonce when signature validation fails", async () => {
    const challenge = await (await GET()).json();
    const validMessage = buildWalletProofMessage(evidenceUrl, account.address, challenge.nonce, challenge.createdAt);
    const validSignature = await account.signMessage({ message: validMessage });
    const invalid = await POST(new Request("http://localhost/api/wallet-proof", {
      method: "POST",
      body: JSON.stringify({
        evidenceUrl, wallet: account.address, nonce: challenge.nonce,
        proofCreatedAt: challenge.createdAt, signature: `0x${"0".repeat(130)}`,
      }),
      headers: { "content-type": "application/json" },
    }));
    expect(invalid.status).toBe(401);

    const valid = await POST(new Request("http://localhost/api/wallet-proof", {
      method: "POST",
      body: JSON.stringify({
        evidenceUrl, wallet: account.address, nonce: challenge.nonce,
        proofCreatedAt: challenge.createdAt, signature: validSignature,
      }),
      headers: { "content-type": "application/json" },
    }));
    expect(valid.status).toBe(200);
  });
});
