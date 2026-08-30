const RPC_URL = "https://sepolia.base.org";
const EXPECTED_CHAIN_ID = 84532n;

async function rpc(method, params = []) {
  const response = await fetch(RPC_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });

  if (!response.ok) {
    throw new Error(`RPC HTTP ${response.status}`);
  }

  const payload = await response.json();
  if (payload.error) {
    throw new Error(`RPC ${method}: ${payload.error.message ?? "unknown error"}`);
  }
  return payload.result;
}

function formatEther(wei) {
  const base = 10n ** 18n;
  const whole = wei / base;
  const fraction = (wei % base).toString().padStart(18, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : `${whole}`;
}

const address = process.argv[2];
if (address && !/^0x[a-fA-F0-9]{40}$/.test(address)) {
  throw new Error("Endereço inválido. Use apenas o endereço público 0x... da carteira de teste.");
}

const chainId = BigInt(await rpc("eth_chainId"));
if (chainId !== EXPECTED_CHAIN_ID) {
  throw new Error(`Rede incorreta: esperado ${EXPECTED_CHAIN_ID}, recebido ${chainId}`);
}

const blockNumber = BigInt(await rpc("eth_blockNumber"));
console.log(`PASS  Base Sepolia chainId=${chainId}`);
console.log(`PASS  RPC respondeu no bloco ${blockNumber}`);

if (!address) {
  console.log("INFO  Passe o endereço público da carteira para também validar o saldo de ETH de teste.");
  console.log("INFO  Exemplo: npm run preflight:base-sepolia -- 0xSEU_ENDERECO_PUBLICO");
  process.exit(0);
}

const balanceWei = BigInt(await rpc("eth_getBalance", [address, "latest"]));
console.log(`INFO  Carteira pública: ${address}`);
console.log(`INFO  Saldo Base Sepolia: ${formatEther(balanceWei)} ETH de teste`);

if (balanceWei === 0n) {
  throw new Error("A carteira ainda não possui ETH de teste. Use um faucet da Base Sepolia e repita o preflight.");
}

console.log("PASS  Carteira possui ETH de teste para estimar/tentar o deploy.");
