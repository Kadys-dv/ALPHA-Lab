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
- React Three Fiber/Drei e Three.js com carregamento sob demanda;
- fallback adaptativo do 3D para reduced motion, economia de dados, pouca memória, telas pequenas e ausência de WebGL;
- Framer Motion;
- layout responsivo;
- conexão EVM encapsulada em `hooks/useEvmWallet.ts`;
- troca/adição de Base Sepolia;
- listeners `accountsChanged`, `chainChanged` e `disconnect` com cleanup;
- tratamento de carteira ausente, rede incorreta e cancelamento;
- dados públicos encapsulados em `hooks/usePublicStatus.ts`;
- desafio de revisão estruturada de README;
- prova técnica com Chain ID, supply, contrato e BaseScan;
- validação de repositório ou Pull Request público do GitHub;
- consentimento explícito de testnet;
- submissão por GitHub Issue;
- métricas públicas de produto derivadas de Issues;
- perfis públicos de Builders aceitos em `/builders/[issue]`;
- endpoint `/api/version` para rastreabilidade de deploy;
- metadata canônica/Open Graph, `robots.txt` e `sitemap.xml`;
- skip link para navegação por teclado;
- bundle e deploy para Cloudflare Workers via vinext.

## Performance do 3D

`components/three/PerformanceAwareAlpha.tsx` usa importação dinâmica para retirar React Three Fiber/Drei/Three.js do caminho crítico inicial. A cena completa só é habilitada em dispositivos capazes e depois de uma janela ociosa do navegador.

No build de produção validado do hardening, o bundle `AlphaBuildersApp` ficou em aproximadamente **147,63 kB minificado / 47,78 kB gzip**, enquanto `FloatingAlpha` apareceu em um chunk separado de aproximadamente **843,76 kB / 223,94 kB gzip**. O chunk 3D continua grande, mas é carregado sob demanda e possui fallback visual estático para dispositivos restritos.

A geometria da cena também foi reduzida: menor detalhe do icosaedro, menos segmentos nos torus, DPR máximo menor e intensidades ajustadas sem mudar a direção visual.

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
      builders/[issue]/
      robots.ts
      sitemap.ts
    components/
      three/FloatingAlpha.tsx
      three/PerformanceAwareAlpha.tsx
    hooks/
      useEvmWallet.ts
      usePublicStatus.ts
    lib/
      builders.ts
      validation.ts
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

O hardening de produto/performance foi publicado e validado no commit `68c8060e23e1d6bcd184d8735de1cabed6732a6c`.

## Smoke test

`.github/workflows/frontend-smoke.yml` compila e inicia a fonte canônica em ambiente efêmero e agora também valida os novos marcadores de acessibilidade/submissão e a estrutura ampliada de `/api/status`.

`.github/workflows/cloudflare-production-smoke.yml` testa a implantação pública real em Cloudflare Workers, incluindo página, APIs e invariantes de rede/contrato. Esse smoke também roda em agenda periódica.

## Contribuições

O formulário aceita exatamente:

- `https://github.com/owner/repo`;
- `https://github.com/owner/repo/pull/123`.

A URL de Pull Request é preservada como `Evidence`, enquanto o repositório base é normalizado em `Repository`. Submissões legadas sem a linha `Evidence` continuam compatíveis.

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

## Histórico público e perfis

`/api/status` consulta apenas Issues públicas e devolve:

- total de submissões;
- total em revisão;
- total aceito;
- taxa de aceite;
- Builders únicos;
- projetos distintos;
- até 12 Builders aceitos com Issue, repositório, evidência e endereço EVM abreviado.

A rota `/builders/[issue]` só publica um perfil quando a Issue possui label `accepted` e a submissão pode ser analisada com segurança. O perfil mostra projeto, evidência, carteira abreviada, Issue e data pública de validação.

O frontend não renderiza HTML arbitrário de Issues e só publica campos extraídos por regras restritas.

## Métricas

Classificação recomendada:

- `ON_CHAIN`: dados verificáveis do contrato, como supply;
- `GITHUB`: submissões, revisões, aceites, taxa de aceite, Builders únicos e projetos distintos;
- `STATIC`: Chain ID e contrato configurado.

A avaliação de produto deve priorizar submissão, conclusão, aceitação, diversidade de projetos e repetição de uso, não quantidade de tokens.

## Rastreabilidade

`/api/version` retorna `version`, `chainId`, `contract` e o SHA disponível no ambiente. O build/deploy injeta `NEXT_PUBLIC_GIT_SHA`.

A URL Cloudflare é publicada diretamente a partir de `web/`, e o deploy só é considerado válido depois que o smoke pós-publicação confirma a correspondência exata do SHA.
