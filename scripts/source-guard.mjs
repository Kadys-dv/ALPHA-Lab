import fs from "node:fs";

const contract = fs.readFileSync("contracts/AlphaToken.sol", "utf8");
const contractCode = contract
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\/\/.*$/gm, "");
const config = fs.readFileSync("hardhat.config.ts", "utf8");
const ignition = fs.readFileSync("ignition/modules/AlphaToken.ts", "utf8");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

const checks = [
  [
    "ERC-20 OpenZeppelin import",
    /@openzeppelin\/contracts\/token\/ERC20\/ERC20\.sol/.test(contract),
  ],
  ["Token name Alpha", /ERC20\("Alpha",\s*"ALPHA"\)/.test(contract)],
  ["Fixed supply 100M", /100_000_000\s*\*\s*10\s*\*\*\s*18/.test(contract)],
  ["Single constructor mint", (contract.match(/_mint\s*\(/g) ?? []).length === 1],
  ["Mint goes to deployer", /_mint\(msg\.sender,\s*INITIAL_SUPPLY\)/.test(contract)],
  ["No public mint function", !/function\s+mint\s*\(/i.test(contractCode)],
  ["No ownership layer", !/Ownable|onlyOwner|owner\s*\(/.test(contractCode)],
  [
    "No access-control layer",
    !/AccessControl|DEFAULT_ADMIN_ROLE|grantRole/.test(contractCode),
  ],
  ["No pause mechanism", !/Pausable|whenNotPaused|_pause\s*\(/.test(contractCode)],
  ["No blacklist mechanism", !/blacklist|denylist|blocklist/i.test(contractCode)],
  ["No transfer tax/fee logic", !/tax|fee|commission/i.test(contractCode)],
  [
    "Solidity 0.8.34",
    /version:\s*"0\.8\.34"/.test(config) && /pragma solidity \^0\.8\.34/.test(contract),
  ],
  ["Base Sepolia chainId 84532", /chainId:\s*84532/.test(config)],
  [
    "Base Sepolia key via config variable",
    /configVariable\("BASE_SEPOLIA_PRIVATE_KEY"\)/.test(config),
  ],
  [
    "No Base mainnet deployment target",
    !/chainId:\s*8453\b/.test(config) &&
      !/mainnet\.base\.org/.test(config) &&
      !/baseMainnet|base_mainnet/i.test(config),
  ],
  ["Ignition deploys AlphaToken", /m\.contract\("AlphaToken"\)/.test(ignition)],
  ["Hardhat pinned 3.15.0", pkg.devDependencies?.hardhat === "3.15.0"],
  [
    "OpenZeppelin pinned 5.6.1",
    pkg.devDependencies?.["@openzeppelin/contracts"] === "5.6.1",
  ],
];

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) failed++;
}

console.log(`\n${checks.length - failed}/${checks.length} source/config invariants passed.`);
if (failed) process.exit(1);
