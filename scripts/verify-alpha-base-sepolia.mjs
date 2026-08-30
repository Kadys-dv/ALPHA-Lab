const RPC_URL = "https://sepolia.base.org";
const EXPECTED_CHAIN_ID = 84532n;
const EXPECTED_SUPPLY = 100_000_000n * 10n ** 18n;

async function rpc(method, params = []) {
  const response = await fetch(RPC_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  if (!response.ok) throw new Error(`RPC HTTP ${response.status}`);
  const payload = await response.json();
  if (payload.error) throw new Error(`RPC ${method}: ${payload.error.message ?? "unknown error"}`);
  return payload.result;
}

function validateAddress(value, label) {
  if (!/^0x[a-fA-F0-9]{40}$/.test(value ?? "")) {
    throw new Error(`${label} inválido. Use um endereço público 0x...`);
  }
  return value.toLowerCase();
}

function decodeUint(hex) {
  return BigInt(hex);
}

function decodeString(hex) {
  const data = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (data.length < 128) throw new Error("Retorno ABI de string inválido");
  const offsetBytes = Number(BigInt(`0x${data.slice(0, 64)}`));
  const offset = offsetBytes * 2;
  const lengthBytes = Number(BigInt(`0x${data.slice(offset, offset + 64)}`));
  const start = offset + 64;
  const raw = data.slice(start, start + lengthBytes * 2);
  return Buffer.from(raw, "hex").toString("utf8");
}

function balanceOfData(address) {
  return `0x70a08231${address.slice(2).padStart(64, "0")}`;
}

async function ethCall(to, data) {
  return rpc("eth_call", [{ to, data }, "latest"]);
}

const contract = validateAddress(process.argv[2], "Endereço do contrato");
const deployer = process.argv[3]
  ? validateAddress(process.argv[3], "Endereço do deployer")
  : null;

const chainId = BigInt(await rpc("eth_chainId"));
if (chainId !== EXPECTED_CHAIN_ID) {
  throw new Error(`Rede incorreta: esperado ${EXPECTED_CHAIN_ID}, recebido ${chainId}`);
}

const code = await rpc("eth_getCode", [contract, "latest"]);
if (!code || code === "0x") throw new Error("Nenhum bytecode encontrado nesse endereço.");

const name = decodeString(await ethCall(contract, "0x06fdde03"));
const symbol = decodeString(await ethCall(contract, "0x95d89b41"));
const decimals = decodeUint(await ethCall(contract, "0x313ce567"));
const totalSupply = decodeUint(await ethCall(contract, "0x18160ddd"));

if (name !== "Alpha") throw new Error(`Nome inesperado: ${name}`);
if (symbol !== "ALPHA") throw new Error(`Símbolo inesperado: ${symbol}`);
if (decimals !== 18n) throw new Error(`Decimais inesperados: ${decimals}`);
if (totalSupply !== EXPECTED_SUPPLY) {
  throw new Error(`Supply inesperado: ${totalSupply}`);
}

console.log(`PASS  Base Sepolia chainId=${chainId}`);
console.log(`PASS  Bytecode publicado (${(code.length - 2) / 2} bytes)`);
console.log(`PASS  name=${name}`);
console.log(`PASS  symbol=${symbol}`);
console.log(`PASS  decimals=${decimals}`);
console.log(`PASS  totalSupply=${totalSupply}`);

if (deployer) {
  const deployerBalance = decodeUint(await ethCall(contract, balanceOfData(deployer)));
  if (deployerBalance !== EXPECTED_SUPPLY) {
    throw new Error(
      `Saldo inicial do deployer não corresponde ao supply. Recebido: ${deployerBalance}. ` +
        "Execute esta checagem antes de transferir ALPHA para outra carteira.",
    );
  }
  console.log("PASS  deployer recebeu 100% do supply inicial");
}

console.log("PASS  ALPHA validada on-chain na Base Sepolia.");
