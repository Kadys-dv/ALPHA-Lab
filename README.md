# ALPHA Lab

Laboratório público para desenvolver e validar o token utilitário ERC-20 **Alpha (ALPHA)** com Hardhat 3, Solidity e Base Sepolia.

O contrato já está publicado e validado em testnet. ALPHA não está à venda, não promete rendimento e não deve ser tratada como investimento. O objetivo atual é provar utilidade real antes de considerar qualquer operação comercial.

## Estado atual

| Item | Estado |
|---|---|
| Contrato ERC-20 | Concluído |
| Testes Solidity | 7 aprovados |
| Invariantes de segurança/configuração | 18 aprovadas |
| Deploy local | Validado |
| Deploy Base Sepolia | Validado |
| Utilidade do produto | Em definição |
| Venda, liquidez e mainnet | Bloqueadas |

## Deploy público

- Rede: **Base Sepolia**
- Chain ID: `84532`
- Contrato: [`0xff15343aCcc4B77479EBE3C4cae32d99d4c60f48`](https://sepolia.basescan.org/address/0xff15343aCcc4B77479EBE3C4cae32d99d4c60f48)
- Deployer: [`0xdb854d4D76a213740621e0dFa48de9BF7836c273`](https://sepolia.basescan.org/address/0xdb854d4D76a213740621e0dFa48de9BF7836c273)
- Data da validação: `2026-08-31`

Verificações on-chain concluídas:

- bytecode publicado;
- `name = Alpha`;
- `symbol = ALPHA`;
- `decimals = 18`;
- supply fixo de **100.000.000 ALPHA**;
- 100% do supply inicial entregue ao deployer.

## Propriedades do contrato

- implementação ERC-20 do OpenZeppelin Contracts;
- supply fixo e mint único no construtor;
- sem mint posterior;
- sem owner/admin;
- sem taxa de transferência;
- sem blacklist ou pause;
- sem proxy ou upgrade;
- sem função de venda, staking ou rendimento.

## Desenvolvimento local

Requisitos:

- Node.js `22.13.0` ou superior;
- npm;
- Git.

Instale e valide:

```bash
npm ci
npm run validate
```

O comando `validate` executa guardas do código-fonte, compilação, testes Solidity e deploy local efêmero.

Comandos individuais:

```bash
npm run guard
npm run build
npm test
npm run deploy:local
```

## Base Sepolia

O fluxo de testnet usa RPC público, Hardhat Keystore e ETH de teste sem valor real:

```bash
npm run preflight:base-sepolia -- 0xSEU_ENDERECO
npx hardhat keystore set BASE_SEPOLIA_PRIVATE_KEY
npm run deploy:base-sepolia
npm run verify:base-sepolia -- 0xCONTRATO 0xDEPLOYER
```

Nunca envie seed phrase ou chave privada pelo chat, por issue, commit, `.env` versionado ou GitHub Actions.

## Estratégia de produto

ALPHA deverá funcionar como acesso, recompensa ou desconto dentro de um produto digital. A receita inicial deverá vir de utilidades reais, como serviços, assinaturas, parcerias ou licenciamento, e não da expectativa de valorização do token.

Operação gratuita é uma meta apenas para o laboratório e a validação inicial. Uma futura operação com usuários poderá exigir gastos com segurança, infraestrutura, contabilidade, suporte e revisão jurídica.

## Documentação

- [Desenho do token](docs/DESIGN.md)
- [Deploy e evidências da Base Sepolia](docs/BASE-SEPOLIA.md)
- [Estratégia de monetização](docs/MONETIZATION.md)
- [Hipótese de produto ALPHA Builders](docs/PRODUCT.md)
- [Roteiro de descoberta](docs/DISCOVERY.md)
- [Roadmap](docs/ROADMAP.md)
- [Política de segurança](docs/SECURITY.md)

## Escopo bloqueado

Enquanto os gates de produto, segurança e conformidade não forem cumpridos, permanecem fora do escopo:

- Base Mainnet;
- venda pública de ALPHA;
- pool de liquidez;
- promessa de preço, lucro ou valorização;
- staking ou rendimento;
- custódia de ativos de terceiros.

## Licença e responsabilidade

Este repositório é um laboratório técnico e não constitui oferta, recomendação de investimento, consultoria jurídica ou garantia de retorno.
