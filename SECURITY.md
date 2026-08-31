# Security Policy

ALPHA Lab is an educational testnet project. It is not approved for custody, token sales, liquidity, yield, staking or mainnet financial activity.

## Reporting

Do not publish exploitable vulnerabilities or secrets in public issues. Report security concerns privately to the repository owner, including the affected component, reproduction steps and expected impact. Never include seed phrases or private keys.

## Scope boundaries

- Base Sepolia/testnet only unless a future review explicitly changes this boundary.
- No user-fund custody.
- No public sale, liquidity, yield promise or investment claim.
- Deployment keys must remain outside version control and use an isolated testnet wallet.

Detailed operational guidance is maintained in `docs/SECURITY.md`.

Changes involving the ERC-20 contract, wallet connection, submission validation or deployment infrastructure require tests and explicit security-impact review.