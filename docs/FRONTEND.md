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
- React Three Fiber e Three.js com carregamento sob demanda;
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
- Playwright, Axe e Lighthouse CI;
- bundle e deploy para Cloudflare Workers via vinext.

## Estrutura modular

A aplicação principal continua em `components/AlphaBuildersApp.tsx`, mas responsabilidades com estado próprio foram extraídas para módulos independentes:

```text
web/
  app/
    api/status/
    api/version/
    builders/[issue]/
  components/
    builders/BuildersSection.tsx
    submission/SubmissionSection.tsx
    three/FloatingAlpha.tsx
    three/PerformanceAwareAlpha.tsx
  hooks/
    useEvmWallet.ts
    usePublicStatus.ts
  lib/
    builders.ts
    validation.ts
```

`SubmissionSection` concentra validação e preparação da Issue. `BuildersSection` concentra métricas, disponibilidade da fonte pública e histórico aceito.

## Performance do 3D

`components/three/PerformanceAwareAlpha.tsx` usa importação dinâmica para retirar a cena completa do caminho crítico inicial. O 3D só é habilitado em dispositivos capazes e depois de uma janela ociosa do navegador.

`FloatingAlpha.tsx` usa React Three Fiber/Three.js diretamente para animação, pointer response e materiais. Os helpers de Drei não são mais importados pelo runtime lazy da cena. A dependência ainda pode existir no manifesto do projeto enquanto sua remoção total não for tratada separadamente.

No build Cloudflare validado desta fase:

- `AlphaBuildersApp`: aproximadamente **149,38 kB minificado / 48,35 kB gzip**;
- `FloatingAlpha`: aproximadamente **840,52 kB / 222,51 kB gzip**, em chunk lazy separado.

O chunk 3D continua acima de 500 kB e o build mantém esse aviso visível; não foi mascarado aumentando artificialmente o limite. O carregamento adaptativo evita que esse custo entre no caminho crítico em dispositivos restritos.

## `/api/status` resiliente

O endpoint de métricas depende da API pública do GitHub. Essa dependência externa não é tratada como fonte infalível.

O contrato atual retorna:

- `state`: `ok`, `partial` ou `unavailable`;
- `checkedAt`;
- métricas como `number | null`;
- Builders públicos quando a fonte necessária estiver disponível.

Se o GitHub falhar, sofrer rate limit ou ficar indisponível, métricas ausentes ficam `null`. A interface mostra `—` e uma mensagem de disponibilidade, em vez de inventar `0`.

Métricas atuais:

- submissões;
- em revisão;
- aceitas;
- taxa de aceite;
- Builders únicos;
- projetos distintos;
- Builders recorrentes;
- aceites por Builder.

## Perfis públicos

`/builders/[issue]` só publica uma prova quando a Issue está marcada como `accepted` e o conteúdo pode ser interpretado com segurança.

O perfil mostra:

- projeto;
- evidência pública;
- endereço EVM abreviado;
- Issue pública;
- data de submissão e aceitação;
- critérios verificáveis;
- histórico `Submitted → Parsed → Accepted`.

A aprovação continua humana e o perfil não atribui valor financeiro à contribuição.

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

`web/package-lock.json` está versionado e é obrigatório. O build Next fixa explicitamente `turbopack.root` em `web/`, evitando ambiguidade causada pelos lockfiles do monorepositório.

`.github/workflows/cloudflare-build.yml` adiciona:

```bash
npm ci
npm run build:vinext
```

Os workflows principais usam `actions/checkout@v7` e `actions/setup-node@v7`.

## Browser Quality

`.github/workflows/frontend-browser-quality.yml` inicia a build canônica e executa testes reais em Chromium.

A suíte Playwright cobre:

- presença do conteúdo crítico da home;
- primeiro foco de teclado no skip link;
- fluxo válido de Pull Request com carteira EVM mockada em Base Sepolia;
- rejeição de evidência fora do GitHub.

Axe é injetado no navegador e bloqueia violações WCAG 2 A/AA com impacto sério ou crítico.

Lighthouse CI exige:

- Performance >= 0,85;
- Accessibility >= 0,95;
- Best Practices >= 0,95;
- SEO >= 0,95.

Esses budgets são gates de CI; não são métricas de marketing.

## Deploy Cloudflare

`.github/workflows/cloudflare-deploy.yml` publica automaticamente mudanças de `web/**` ou do próprio workflow que chegam à `main`. O modo manual continua disponível com confirmação explícita.

Antes da publicação, o workflow executa os gates do frontend e o build vinext. Depois do deploy, valida:

- `ALPHA`;
- `Base Sepolia`;
- hero atual `Aprenda construindo.`;
- ausência de Base Mainnet, compra, swap e staking;
- `/api/version`;
- `/api/status`;
- Chain ID `84532`;
- contrato oficial;
- SHA de produção exatamente igual ao commit implantado.

Como o Cloudflare pode apresentar uma pequena janela de propagação após publicar uma nova versão, o workflow consulta `/api/version` com cache-busting e aguarda por uma janela limitada. Ele só avança quando recebe exatamente `GITHUB_SHA`; um SHA antigo ou incorreto após o timeout continua falhando o deploy.

A fase de reliability/browser-quality foi publicada no commit `cd514c2b3d6ef55bad24752031a90eba495e8427`. O hardening posterior do verificador de propagação foi publicado no commit `48e183e39907d8ea7300966691eff6c7a19a28f5`.

## Smoke test

`.github/workflows/frontend-smoke.yml` compila e inicia a fonte canônica em ambiente efêmero e valida os marcadores, `/api/version` e o contrato resiliente de `/api/status`.

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

## Segurança preservada

O frontend não habilita:

- Base Mainnet;
- compra ou venda de ALPHA;
- transferência de ativos;
- `approve` ou `permit`;
- swap, bridge ou staking;
- assinatura de mensagens ou transações financeiras;
- promessa de preço, lucro, rendimento ou valorização.

## Rastreabilidade

`/api/version` retorna `version`, `chainId`, `contract` e o SHA disponível no ambiente. O build/deploy injeta `NEXT_PUBLIC_GIT_SHA`.

A URL Cloudflare é publicada diretamente a partir de `web/`, e o deploy só é considerado válido depois que a verificação pós-publicação confirma a correspondência exata do SHA.
