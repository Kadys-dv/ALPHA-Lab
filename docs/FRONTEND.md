# ALPHA Builders — frontend e pipeline

## URL pública atual

https://alpha-builders-web.cskadys.workers.dev

Esta é a URL canônica de produção. O host anterior em `chatgpt.site` permanece apenas como referência histórica e não é mais a fonte pública principal.

## Fonte canônica

A implementação versionada do frontend está em `web/` e é a referência de desenvolvimento e produção do ALPHA Builders.

Principais capacidades versionadas:

- Next.js App Router, React 19 e TypeScript strict;
- direção visual Interactive Storytelling + Neo-Brutalismo Tátil;
- hero “Aprenda construindo. Prove contribuindo.”;
- React Three Fiber/Drei e Three.js com núcleo 3D isolado em `components/three/FloatingAlpha.tsx`;
- Framer Motion;
- layout responsivo e `prefers-reduced-motion`;
- conexão EVM;
- troca/adição de Base Sepolia;
- listeners `accountsChanged`, `chainChanged` e `disconnect` com cleanup;
- tratamento de carteira ausente, rede incorreta e cancelamento;
- desafio de revisão estruturada de README;
- prova técnica com Chain ID, supply, contrato e BaseScan;
- validação de URL GitHub e endereço EVM;
- consentimento explícito de testnet;
- submissão por GitHub Issue;
- métricas públicas de produto derivadas de Issues;
- seção pública de Builders aceitos;
- endpoint `/api/version` para rastreabilidade de deploy;
- bundle e deploy para Cloudflare Workers via vinext.

## Segurança preservada

O frontend não habilita:

- Base Mainnet;
- compra ou venda de ALPHA;
- transferência de ativos;
- `approve` ou `permit`;
- swap, bridge ou staking;
- assinatura de mensagens ou transações financeiras;
- promessa de preço, lucro, rendimento ou valorização.

## Estrutura

```text
ALPHA-Lab/
  contracts/
  docs/
  ignition/
  scripts/
  web/
    app/
      api/status/
      api/version/
    components/
      three/FloatingAlpha.tsx
    lib/
    scripts/
    tests/
    package.json
    package-lock.json
    vite.config.ts
    wrangler.jsonc
```

## CI do frontend

`.github/workflows/frontend-ci.yml` executa:

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm audit --omit=dev --audit-level=high
```

`web/package-lock.json` está versionado e é obrigatório. A CI usa `npm ci` diretamente; não há geração temporária de lockfile.

`.github/workflows/cloudflare-build.yml` adiciona um gate específico de portabilidade:

```bash
npm ci
npm run build:vinext
```

Esse gate não substitui o build Next.js; os dois precisam permanecer válidos.

## Deploy Cloudflare

`.github/workflows/cloudflare-deploy.yml` publica automaticamente mudanças de `web/**` que chegam à `main`. O modo manual continua disponível com confirmação explícita.

Antes da publicação, o workflow executa todos os gates do frontend e o build vinext. Depois do deploy, valida a própria URL pública e exige:

- marcador `ALPHA`;
- `Base Sepolia`;
- hero atual `Aprenda construindo.`;
- ausência de Base Mainnet, compra, swap e staking;
- `/api/version` válido;
- `/api/status` válido;
- Chain ID `84532`;
- contrato oficial;
- SHA de produção exatamente igual ao commit implantado.

## Smoke test

`.github/workflows/frontend-smoke.yml` compila e inicia a fonte canônica em ambiente efêmero.

`.github/workflows/cloudflare-production-smoke.yml` testa a implantação pública real em Cloudflare Workers, incluindo página, APIs e invariantes de rede/contrato. Esse smoke também roda em agenda periódica.

## Contribuições

`.github/workflows/submission-validation.yml` processa Issues `[ALPHA Builders]` e:

- cria/garante labels operacionais;
- aceita tanto submissão prefilled pelo site quanto Issue Form;
- valida URL HTTPS de GitHub;
- confirma repositório público;
- procura README;
- valida endereço EVM público;
- aplica `submission`, `valid`, `invalid`, `needs-review` e `under-review`;
- nunca aplica `accepted` automaticamente.

`accepted` é reservado à revisão humana.

## Histórico público

`/api/status` consulta apenas Issues públicas e devolve:

- total de submissões;
- total em revisão;
- total aceito;
- até 12 Builders aceitos com Issue, repositório e endereço EVM abreviado.

O frontend não renderiza HTML arbitrário de Issues e só publica campos extraídos por expressões restritas.

## Métricas

Classificação recomendada:

- `ON_CHAIN`: dados verificáveis do contrato, como supply;
- `GITHUB`: submissões, revisões e aceites;
- `STATIC`: Chain ID e contrato configurado.

A avaliação de produto deve priorizar submissão, conclusão, aceitação e repetição de uso, não quantidade de tokens.

## Rastreabilidade

`/api/version` retorna `version`, `chainId`, `contract` e o SHA disponível no ambiente. O build/deploy injeta `NEXT_PUBLIC_GIT_SHA`.

A URL Cloudflare é publicada diretamente a partir de `web/`, e o deploy só é considerado válido depois que o smoke pós-publicação confirma a correspondência exata do SHA.
