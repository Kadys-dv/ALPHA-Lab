# ALPHA Lab

Laboratório público para desenvolver e validar o token utilitário ERC-20 **Alpha (ALPHA)** com Hardhat 3, Solidity e Base Sepolia.

O contrato já está publicado e validado em testnet. ALPHA não está à venda, não promete rendimento e não deve ser tratada como investimento. O objetivo atual é validar utilidade real por meio do **ALPHA Builders**, experiência pública voltada à revisão e apresentação de projetos de desenvolvedores.

## Estado atual

| Item | Estado |
|---|---|
| Contrato ERC-20 | Concluído |
| Testes Solidity | 7 aprovados |
| Invariantes de segurança/configuração | 18 aprovadas |
| Deploy Base Sepolia | Validado |
| ALPHA Builders | Publicado |
| Fonte canônica do frontend | Versionada em `web/` |
| Utilidade inicial | Revisão estruturada de README |
| Submissão de contribuições | GitHub Issue real |
| Validação técnica de submissões | GitHub Actions |
| Aprovação final | Revisão humana |
| Build Cloudflare Workers | Preparado via vinext |
| Venda, liquidez e mainnet | Bloqueadas |

## ALPHA Builders

Experiência pública atual: https://alpha-builders.kadys-v2.chatgpt.site

A pasta `web/` contém a fonte canônica e reproduzível do ALPHA Builders, construída a partir do comportamento validado da versão publicada. Ela preserva a identidade neo-brutalista, animações com Framer Motion, elemento 3D com React Three Fiber/Drei, carteira EVM, Base Sepolia, desafio de README, métricas públicas de produto e histórico de Builders aceitos.

A fonte em `web/` não é apresentada como recuperação byte-a-byte dos arquivos originais do host anterior; ela é a implementação versionada que passa a servir como referência de desenvolvimento daqui em diante.

O fluxo de carteira permanece deliberadamente sem operações financeiras: não há compra, transferência, `approve`, `permit`, swap, bridge, staking, assinatura de transação financeira ou integração com Base Mainnet.

## Frontend local

```bash
cd web
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run dev
```

`web/package-lock.json` está versionado. A CI exige instalação reproduzível com `npm ci`; não há mais bootstrap temporário de lockfile.

Para validar também o bundle preparado para Cloudflare Workers:

```bash
npm run build:vinext
```

A integração com vinext é adicional e não substitui os comandos Next.js canônicos.

## Pipeline de contribuições

Submissões do ALPHA Builders são Issues públicas. A automação:

1. reconhece Issues com título `[ALPHA Builders]`;
2. valida URL de repositório GitHub;
3. confirma que o repositório existe e é público;
4. verifica se há README;
5. valida o formato do endereço EVM público;
6. aplica estados técnicos como `valid`, `invalid`, `needs-review` e `under-review`;
7. nunca aplica `accepted` automaticamente.

A aprovação `accepted` permanece uma decisão humana. A seção pública de Builders consome apenas dados públicos sanitizados de Issues aceitas.

## Rastreabilidade de deploy

O frontend expõe `/api/version`, com versão, Chain ID, contrato e SHA de commit quando o ambiente de hospedagem fornece `VERCEL_GIT_COMMIT_SHA`, `GITHUB_SHA` ou `NEXT_PUBLIC_GIT_SHA`. O CI injeta `NEXT_PUBLIC_GIT_SHA` durante o build.

A URL atual em `chatgpt.site` ainda não é controlada por este repositório, então ela não pode ser retroativamente vinculada a um commit. Novos deploys reproduzíveis devem partir da fonte `web/` e publicar o SHA pelo endpoint de versão.

A fonte também está preparada para uma implantação independente em Cloudflare Workers usando vinext, Workers Cache e sem KV ou Cloudflare Images no primeiro deploy. A URL canônica só deve mudar depois de um deploy independente validado por smoke test.

## Deploy público do contrato

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

## Desenvolvimento local do contrato

```bash
npm ci
npm run validate
```

Comandos individuais:

```bash
npm run guard
npm run build
npm test
npm run deploy:local
```

## Base Sepolia

```bash
npm run preflight:base-sepolia -- 0xSEU_ENDERECO
npx hardhat keystore set BASE_SEPOLIA_PRIVATE_KEY
npm run deploy:base-sepolia
npm run verify:base-sepolia -- 0xCONTRATO 0xDEPLOYER
```

Nunca envie seed phrase ou chave privada pelo chat, por issue, commit, `.env` versionado ou GitHub Actions.

## Estratégia de produto

O ALPHA Builders testa utilidade sem depender de venda ou valorização do token. A primeira utilidade escolhida é a revisão estruturada de README, com evidências públicas e submissões rastreáveis por GitHub.

As métricas prioritárias são de produto: submissões, itens em revisão, contribuições aceitas, conclusão e uso repetido. Métricas do token não substituem validação de utilidade.

## Documentação

- [Desenho do token](docs/DESIGN.md)
- [Deploy e evidências da Base Sepolia](docs/BASE-SEPOLIA.md)
- [Estratégia de monetização](docs/MONETIZATION.md)
- [Hipótese de produto ALPHA Builders](docs/PRODUCT.md)
- [Frontend e pipeline](docs/FRONTEND.md)
- [Cloudflare Workers](docs/CLOUDFLARE.md)
- [Roteiro de descoberta](docs/DISCOVERY.md)
- [Roadmap](docs/ROADMAP.md)
- [Política de segurança](docs/SECURITY.md)

## Escopo bloqueado

- Base Mainnet;
- venda pública de ALPHA;
- pool de liquidez;
- promessa de preço, lucro ou valorização;
- staking ou rendimento;
- custódia de ativos de terceiros.

## Licença e responsabilidade

Este repositório é um laboratório técnico e não constitui oferta, recomendação de investimento, consultoria jurídica ou garantia de retorno.
