# ALPHA Builders — produção

## Objetivo

A produção do ALPHA Builders deve ser reproduzível a partir da fonte canônica em `web/`, com o SHA do GitHub rastreável pelo endpoint `/api/version`.

## Cloudflare Workers

O Worker configurado é `alpha-builders-web` e usa `web/wrangler.jsonc`.

O primeiro deploy deliberadamente não exige KV nem Cloudflare Images. O cache usa Workers Cache e os limites financeiros continuam inalterados: sem compra, venda, `approve`, `permit`, swap, bridge, staking ou Base Mainnet.

## Credenciais

O workflow `.github/workflows/cloudflare-deploy.yml` exige dois GitHub Actions Secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Nunca versionar tokens, chaves privadas ou seed phrases.

O token Cloudflare deve usar o menor conjunto de permissões necessário para publicar o Worker desta conta.

## Deploy

O deploy é manual por `workflow_dispatch` e requer confirmação explícita `deploy-alpha-builders`.

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

Após o primeiro deploy independente, validar:

1. `/` responde com sucesso;
2. `/api/version` retorna Chain ID `84532`, contrato correto e SHA do deploy;
3. `/api/status` responde sem erro;
4. o formulário de submissão continua funcional;
5. conexão de carteira continua limitada à Base Sepolia;
6. não existem marcadores ou fluxos de compra, swap, staking, `approve` ou Base Mainnet;
7. o endereço público do Worker é registrado no README e no smoke test.

## Atualizações de dependências

Dependabot está configurado para atualizações semanais de npm e mensais de GitHub Actions. Dependências Next/React e Cloudflare/vinext são agrupadas para facilitar revisão.

Dependências beta do vinext devem ser tratadas como mudanças de infraestrutura: nunca aceitar atualização automática sem passar pelos gates Frontend CI, Frontend Smoke, Solidity Validation e Cloudflare Build.

## Proteção da main

A `main` deve exigir PR e os quatro gates abaixo antes de merge:

- Frontend CI
- Frontend Smoke
- Solidity Validation
- Cloudflare Build

Esta regra é configuração do repositório no GitHub e não deve ser simulada por documentação ou por um workflow que possa ser contornado.
