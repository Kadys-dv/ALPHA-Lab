# ALPHA Lab

Projeto independente e educacional para criar e estudar o token ERC-20 **Alpha (ALPHA)** sem gastar dinheiro real.

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
│   ├── ROADMAP.md
│   └── SECURITY.md
├── hardhat.config.ts
├── package.json
└── README.md
```

## Importante

ALPHA v0.1 é um laboratório. Não foi projetado como investimento, não promete rendimento e não está sendo vendido. Mainnet e dinheiro real estão explicitamente fora do escopo atual.
