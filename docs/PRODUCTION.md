# ALPHA Builders — produção

## Objetivo

A produção do ALPHA Builders deve ser reproduzível a partir da fonte canônica em `web/`, com o SHA do GitHub rastreável pelo endpoint `/api/version`.

## Cloudflare Workers

O Worker configurado é `alpha-builders-web` e usa `web/wrangler.jsonc`.

A implantação atual não exige KV. O cache usa Workers Cache e os limites financeiros continuam inalterados: sem compra, venda, `approve`, `permit`, swap, bridge, staking ou Base Mainnet.

## Credenciais

O workflow `.github/workflows/cloudflare-deploy.yml` exige dois GitHub Actions Secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Nunca versionar tokens, chaves privadas ou seed phrases.

O token Cloudflare deve usar o menor conjunto de permissões necessário para publicar o Worker desta conta.

## Deploy

O deploy é automático quando mudanças em `web/**` ou no próprio workflow de deploy chegam à `main`. O modo manual por `workflow_dispatch` continua disponível e exige a confirmação explícita `deploy-alpha-builders`.

Antes de publicar, o workflow executa:

```bash
npm ci --no-audit --no-fund
npm run lint
npm run typecheck
npm test
npm run build
npm audit --omit=dev --audit-level=high
npm run build:vinext
```

Somente depois executa:

```bash
npm run deploy:vinext
```

## Verificação pós-deploy

Depois da publicação, o workflow valida:

1. `/` responde e contém os marcadores canônicos do ALPHA Builders;
2. não existem marcadores de Base Mainnet, compra, swap ou staking;
3. `/api/version` retorna Chain ID `84532` e o contrato oficial;
4. `/api/version.commit` corresponde exatamente a `GITHUB_SHA`;
5. `/api/status` possui `metrics`, `checkedAt` e `state` válido (`ok`, `partial` ou `unavailable`);
6. a implantação só é concluída depois dessas invariantes.

### Janela de propagação

O Cloudflare pode servir a versão anterior por alguns segundos logo após o Worker ser atualizado. Isso não deve fazer o pipeline aceitar um SHA antigo nem gerar um falso negativo imediato.

A verificação atual usa cache-busting e consulta `/api/version` repetidamente por uma janela limitada. Ela termina com sucesso somente quando o endpoint retorna exatamente `GITHUB_SHA`. Se o SHA esperado não aparecer dentro do timeout, o deploy falha.

Essa proteção foi validada em produção no commit `48e183e39907d8ea7300966691eff6c7a19a28f5`.

## Browser quality

O workflow `.github/workflows/frontend-browser-quality.yml` adiciona uma camada diferente dos testes unitários e smokes de HTTP.

Ele executa:

- Playwright em Chromium;
- fluxo de submissão com carteira EVM mockada;
- navegação por teclado;
- Axe WCAG 2 A/AA;
- Lighthouse CI.

Budgets mínimos do Lighthouse:

- Performance >= 85%;
- Accessibility >= 95%;
- Best Practices >= 95%;
- SEO >= 95%.

A suíte também falha em violações Axe sérias ou críticas.

## Saúde da fonte GitHub

`/api/status` depende de dados públicos do GitHub, mas falha upstream não é transformada em métrica `0`.

Estados possíveis:

- `ok`: todas as fontes necessárias responderam;
- `partial`: parte das métricas está disponível;
- `unavailable`: a fonte externa não pôde ser consultada.

Valores ausentes são `null`. O frontend mostra `—` e sinaliza a indisponibilidade.

## Atualizações de dependências

Dependabot está configurado para atualizações semanais de npm e mensais de GitHub Actions. Dependências Next/React e Cloudflare/vinext são agrupadas para facilitar revisão.

Dependências beta do vinext devem ser tratadas como mudanças de infraestrutura: nunca aceitar atualização automática sem passar pelos gates Frontend CI, Frontend Smoke, Frontend Browser Quality, Solidity Validation e Cloudflare Build.

## Proteção da main

A configuração desejada da `main` deve exigir PR e estes gates antes de merge:

- Frontend CI / `validate`;
- Frontend Smoke / `smoke`;
- Frontend Browser Quality / `browser-quality`;
- Solidity Validation / `validate`;
- Cloudflare Build / `validate-workers-build`.

No estado verificado durante este hardening, não havia ruleset de proteção configurado via API. Essa proteção é configuração do repositório no GitHub e não deve ser simulada por documentação ou por um workflow que possa ser contornado.
