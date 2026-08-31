# ALPHA Builders — frontend e pipeline

## URL pública atual

https://alpha-builders.kadys-v2.chatgpt.site

## Fonte canônica

A implementação versionada do frontend está em `web/`.

Ela foi construída a partir do comportamento já validado da experiência publicada e passa a ser a referência de desenvolvimento do ALPHA Builders. Não é apresentada como recuperação byte-a-byte dos arquivos originais do host anterior.

Principais capacidades versionadas:

- Next.js App Router, React 19 e TypeScript strict;
- estética neo-brutalista com Aurora Bloom;
- React Three Fiber/Drei e Three.js;
- Framer Motion;
- layout responsivo;
- conexão EVM;
- troca/adição de Base Sepolia;
- listeners `accountsChanged`, `chainChanged` e `disconnect` com cleanup;
- tratamento de carteira ausente, rede incorreta e cancelamento;
- desafio de revisão estruturada de README;
- validação de URL GitHub e endereço EVM;
- submissão por GitHub Issue;
- métricas públicas de produto derivadas de Issues;
- seção pública de Builders aceitos;
- endpoint `/api/version` para rastreabilidade de deploy;
- fallback para `prefers-reduced-motion`;
- bundle adicional para Cloudflare Workers via vinext.

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

## Smoke test

`.github/workflows/frontend-smoke.yml` compila e inicia a fonte canônica em ambiente efêmero, valida marcadores de ALPHA/Base Sepolia e o endpoint de versão. A URL legada também pode ser sondada sem bloquear a CI canônica.

O host `chatgpt.site` não prova associação retroativa a um commit. Essa limitação só desaparece quando a URL canônica passar a ser publicada diretamente a partir de `web/`.

## Cloudflare Workers

A configuração de portabilidade usa vinext como camada adicional, preservando os scripts Next.js originais. O primeiro deploy foi deliberadamente preparado sem KV e sem Cloudflare Images, usando Workers Cache para CDN. Detalhes estão em `docs/CLOUDFLARE.md`.

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

`/api/version` retorna `version`, `chainId`, `contract` e o SHA disponível no ambiente. O build de CI injeta `NEXT_PUBLIC_GIT_SHA`.

A URL atual em `chatgpt.site` não oferece, por meio deste repositório, controle de deploy ou associação retroativa a um commit. A futura URL canônica independente deve ser publicada a partir de `web/` e validada por smoke test antes de substituir o host legado.
