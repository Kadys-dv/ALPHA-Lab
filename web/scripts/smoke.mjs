const url = process.env.PUBLIC_SITE_URL || "http://127.0.0.1:3000";
const attempts = 12;
let response;
let lastError;

for (let attempt = 1; attempt <= attempts; attempt += 1) {
  try {
    response = await fetch(url, { redirect: "follow" });
    if (response.ok) break;
    lastError = new Error(`Site returned ${response.status}`);
  } catch (error) {
    lastError = error;
  }
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

if (!response?.ok) throw lastError ?? new Error("Site did not become ready");

const html = await response.text();
for (const marker of ["ALPHA", "84532", "Base Sepolia"]) {
  if (!html.includes(marker)) throw new Error(`Missing marker: ${marker}`);
}
for (const marker of ["Base Mainnet", "Comprar ALPHA", "Swap ALPHA", "Stake ALPHA"]) {
  if (html.includes(marker)) throw new Error(`Forbidden marker: ${marker}`);
}

const versionResponse = await fetch(new URL("/api/version", url));
if (!versionResponse.ok) throw new Error(`/api/version returned ${versionResponse.status}`);
const version = await versionResponse.json();
if (version.chainId !== 84532) throw new Error("Unexpected Chain ID in version endpoint");
if (version.contract !== "0xff15343aCcc4B77479EBE3C4cae32d99d4c60f48") throw new Error("Unexpected contract in version endpoint");

console.log(`Canonical smoke OK: ${url}`);
