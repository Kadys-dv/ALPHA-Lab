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
| ALPHA Builders | Publicado no Cloudflare Workers |
| Fonte canônica do frontend | Versionada em `web/` |
| Utilidade inicial | Revisão estruturada de README |
| Evidência aceita | Repositório ou Pull Request público |
| Perfis públicos de Builders | `/builders/[issue]` |
| Submissão de contribuições | GitHub Issue real |
| Validação técnica de submissões | GitHub Actions |
| Aprovação final | Revisão humana |
| Build Cloudflare Workers | Validado via vinext |
| Browser QA | Playwright + Axe |
| Quality budgets | Lighthouse CI |
| Deploy de produção | Automático em mudanças de `web/**` ou do workflow de deploy na `main` |
| Venda, liquidez e mainnet | Bloqueadas |

## ALPHA Builders

Experiência pública canônica: https://alpha-builders-web.cskadys.workers.dev

A pasta `web/` contém a fonte canônica e reproduzível do ALPHA Builders. A experiência atual segue a direção **Interactive Storytelling + Neo-Brutalismo Tátil**, com hero “Aprenda construindo. Prove contribuindo.”, Framer Motion, núcleo 3D com React Three Fiber/Three.js, carteira EVM, Base Sepolia, desafio de README, prova técnica, métricas públicas de produto e histórico de Builders aceitos.

O núcleo 3D é carregado sob demanda e possui fallback adaptativo para `prefers-reduced-motion`, economia de dados, pouca memória, viewport pequena ou ausência de WebGL. A cena lazy não depende mais dos helpers de Drei em runtime e permanece isolada do bundle principal.

O host anterior em `chatgpt.site` é apenas legado e não é mais a URL canônica do projeto.

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

`web/package-lock.json` está versionado. A CI exige instalação reproduzível com `npm ci`; não há bootstrap temporário de lockfile.

Para validar também o bundle do Cloudflare Workers:

```bash
npm run build:vinext
```

A integração com vinext é adicional e não substitui os comandos Next.js canônicos.

## Qualidade de navegador

Além de lint, TypeScript, Vitest e build, o projeto possui `.github/workflows/frontend-browser-quality.yml`.

Esse gate inicia a aplicação canônica e executa:

- Playwright em Chromium;
- navegação por teclado e skip link;
- submissão válida por Pull Request com carteira EVM mockada;
- rejeição de evidência fora do `github.com`;
- Axe com WCAG 2 A/AA, bloqueando violações sérias ou críticas;
- Lighthouse CI com budgets mínimos de 85% para performance e 95% para acessibilidade, best practices e SEO.

## Pipeline de contribuições

Submissões do ALPHA Builders são Issues públicas. O frontend aceita como evidência a URL pública de um repositório ou de um Pull Request do GitHub e normaliza a evidência para o repositório correspondente. A automação:

1. reconhece Issues com título `[ALPHA Builders]`;
2. valida URL de repositório GitHub;
3. confirma que o repositório existe e é público;
4. verifica se há README;
5. valida o formato do endereço EVM público;
6. aplica estados técnicos como `valid`, `invalid`, `needs-review` e `under-review`;
7. nunca aplica `accepted` automaticamente.

A aprovação `accepted` permanece uma decisão humana. Builders aceitos ganham um perfil público sanitizado em `/builders/[issue]`, com projeto, evidência, carteira abreviada, Issue, critérios verificáveis e histórico de submissão → análise → aceitação.

## Métricas de produto e disponibilidade

`/api/status` deriva dados exclusivamente de Issues públicas e expõe:

- submissões;
- itens em revisão;
- contribuições aceitas;
- taxa de aceite;
- Builders únicos;
- projetos distintos;
- Builders recorrentes;
- aceites por Builder;
- até 12 Builders aceitos com links para evidência e perfil público.

O endpoint diferencia `ok`, `partial` e `unavailable`. Se a API pública do GitHub estiver indisponível ou limitada, valores ausentes ficam `null` e a interface mostra `—`; falha externa nunca é convertida em um zero falso. `checkedAt` registra quando a fonte pública foi consultada.

## Performance

O build Cloudflare da fase atual manteve o bundle principal `AlphaBuildersApp` em aproximadamente **149,38 kB minificado / 48,35 kB gzip**. O 3D permanece em chunk lazy separado, aproximadamente **840,52 kB / 222,51 kB gzip**, e só é habilitado em dispositivos capazes.

A configuração do Next fixa explicitamente o `turbopack.root` em `web/`, removendo a ambiguidade de workspace que antes aparecia durante o build.

## Rastreabilidade e produção

O frontend expõe `/api/version`, com versão, Chain ID, contrato e SHA de commit. O deploy Cloudflare injeta `NEXT_PUBLIC_GIT_SHA` e valida depois da publicação que o SHA servido em produção é exatamente o commit implantado.

`.github/workflows/cloudflare-deploy.yml` publica automaticamente quando `web/**` ou o próprio workflow de deploy muda na `main` e mantém também um disparo manual protegido. Antes do deploy ele executa instalação reproduzível, lint, TypeScript strict, testes, build Next.js, audit e build vinext.

Após a publicação, a verificação usa cache-busting e aguarda a propagação do `/api/version` por uma janela limitada, mas continua exigindo correspondência exata com `GITHUB_SHA`. Um SHA diferente após o timeout continua bloqueando o deploy. Também valida a página pública, Base Sepolia, `/api/status`, Chain ID, contrato e ausência de CTAs financeiros proibidos.

O frontend também publica `robots.txt`, `sitemap.xml`, metadata canônica/Open Graph e um skip link para navegação por teclado. `.github/workflows/cloudflare-production-smoke.yml` mantém um smoke real da URL pública.

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

As métricas prioritárias são de produto: submissão, revisão, aceitação, diversidade de projetos e repetição de uso. Métricas do token não substituem validação de utilidade.

## Documentação

- [Desenho do token](docs/DESIGN.md)
- [Deploy e evidências da Base Sepolia](docs/BASE-SEPOLIA.md)
- [Estratégia de monetização](docs/MONETIZATION.md)
- [Hipótese de produto ALPHA Builders](docs/PRODUCT.md)
- [Frontend e pipeline](docs/FRONTEND.md)
- [Cloudflare Workers](docs/CLOUDFLARE.md)
- [Produção](docs/PRODUCTION.md)
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
