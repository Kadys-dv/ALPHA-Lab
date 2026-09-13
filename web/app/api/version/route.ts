import { NextResponse } from "next/server";
import { ALPHA_CONTRACT, BASE_SEPOLIA } from "@/lib/constants";
import packageJson from "../../../package.json";

export async function GET(){
  const commit = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || process.env.NEXT_PUBLIC_GIT_SHA || "unknown";
  return NextResponse.json({
    app: "alpha-builders-web",
    version: packageJson.version,
    commit,
    chainId: BASE_SEPOLIA.chainId,
    contract: ALPHA_CONTRACT,
    generatedAt: new Date().toISOString()
  }, { headers: { "Cache-Control": "no-store" } });
}
