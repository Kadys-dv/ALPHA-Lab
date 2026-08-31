# ALPHA Lab

Projeto independente para desenvolver e validar o token utilitário ERC-20 **Alpha (ALPHA)** sem gastar dinheiro real durante o laboratório.

O objetivo comercial futuro não é prometer valorização do token. A estratégia é usar ALPHA como acesso e recompensa dentro de um produto digital; a receita deverá vir de utilidades reais, como serviços e assinaturas, inicialmente cobrados em reais.

## Estado da v0.1

- ERC-20 de supply fixo: **100.000.000 ALPHA**
- 18 decimais
- supply inteiro entregue ao deployer
- sem mint posterior
- sem owner/admin
- sem taxas
- sem blacklist
- sem pause
- sem proxy/upgrade
- sem venda
- alvo de rede pública: **Base Sepolia (testnet)**
- contrato público validado: `0xff15343aCcc4B77479EBE3C4cae32d99d4c60f48`

O contrato usa a implementação ERC-20 do OpenZeppelin Contracts.

## Requisitos

- Node.js 22.13.0 ou superior
- npm
- VS Code opcional

## Instalação

```bash
npm install
```

## Compilar

```bash
npm run build
```

## Testar

```bash
npm test
```

Os testes conferem nome, símbolo, 18 decimais, supply total, saldo inicial do deployer e transferência sem alteração de supply.

## Deploy local sem dinheiro

```bash
npm run deploy:local
```

Ou, para manter uma blockchain local rodando:

Terminal 1:

```bash
npm run node
```

Terminal 2:

```bash
npx hardhat ignition deploy ignition/modules/AlphaToken.ts --network localhost
```

## Base Sepolia — R$ 0

A configuração já aponta para o RPC público da Base Sepolia e usa chain ID `84532`.

Crie uma carteira exclusiva para testes. Nunca use a seed phrase ou chave de uma carteira que possua dinheiro real.

Salve a chave de teste no keystore do Hardhat:

```bash
npx hardhat keystore set BASE_SEPOLIA_PRIVATE_KEY
```

Depois de obter ETH **de testnet** gratuitamente em um faucet da Base Sepolia:

```bash
npm run deploy:base-sepolia
```

O ETH da Base Sepolia não possui valor real. O deploy nessa rede serve apenas para aprendizado.

Contrato publicado e validado on-chain:

```text
https://sepolia.basescan.org/address/0xff15343aCcc4B77479EBE3C4cae32d99d4c60f48
```

## Estrutura

```text
ALPHA-Lab/
├── contracts/
│   ├── AlphaToken.sol
│   └── AlphaToken.t.sol
├── ignition/modules/
│   └── AlphaToken.ts
├── docs/
│   ├── DESIGN.md
│   ├── MONETIZATION.md
│   ├── ROADMAP.md
│   └── SECURITY.md
├── hardhat.config.ts
├── package.json
└── README.md
```

## Importante

ALPHA v0.1 é um laboratório. Não foi projetado como investimento, não promete rendimento e não está sendo vendido. Mainnet e dinheiro real estão explicitamente fora do escopo atual. O plano comercial e seus gates estão em `docs/MONETIZATION.md`.
