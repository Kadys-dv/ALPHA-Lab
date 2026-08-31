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
- fallback para `prefers-reduced-motion`.

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

Como o frontend foi introduzido sem um lockfile recuperável do host anterior, o workflow atual cria um `package-lock.json` temporário quando ele não existe e então executa `npm ci`. Esse bootstrap deve desaparecer assim que um `web/package-lock.json` validado for versionado.

## Smoke test

`.github/workflows/frontend-smoke.yml` verifica a URL pública e exige marcadores de ALPHA/Base Sepolia, além de rejeitar marcadores explícitos de Mainnet, compra, swap ou staking.

O smoke testa a disponibilidade da implantação atual, mas não prova que `chatgpt.site` foi gerado pelo commit do repositório. Essa limitação permanece até a hospedagem passar a fazer deploy diretamente da fonte `web/`.

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

A URL atual em `chatgpt.site` não oferece, por meio deste repositório, controle de deploy ou associação retroativa a um commit. Novos deploys reproduzíveis devem ser feitos a partir de `web/`.
