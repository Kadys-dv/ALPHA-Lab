# ALPHA Builders — Cloudflare Workers

O frontend canônico em `web/` está preparado para uma implantação independente no Cloudflare Workers usando vinext.

## Estratégia

- Next.js continua sendo o runtime de desenvolvimento e build canônico (`npm run dev`, `npm run build`, `npm start`).
- vinext é uma camada adicional, não destrutiva, para empacotamento em Cloudflare Workers.
- O primeiro deploy não usa KV nem Cloudflare Images.
- O cache de CDN usa Workers Cache.
- O Worker é identificado como `alpha-builders-web`.

## Validação local

```bash
cd web
npm ci
npm run build:vinext
npm test
npm run build
```

## Segurança e escopo

A preparação de hospedagem não altera o contrato ALPHA nem adiciona operações financeiras. Permanecem bloqueados Base Mainnet, venda pública de ALPHA, transfer/approve/permit, swaps, bridges, staking, yield e assinaturas financeiras.

## Implantação

Quando uma conta Cloudflare exclusiva do ALPHA estiver disponível, a implantação pode usar o script `npm run deploy:vinext` a partir de `web/`. Credenciais do Cloudflare não devem ser commitadas; devem ficar exclusivamente no provedor/secret store apropriado.
# Estado durável e limitações

O `wrangler.jsonc` atual não declara bindings KV ou D1. Portanto, o nonce de prova
e o snapshot de `/api/status` usam memória do processo/isolamento como fallback.
Isso mantém o deploy sem infraestrutura especulativa, mas não oferece garantia de
compartilhamento entre isolates ou reinícios. A rota aceita o binding opcional
`ALPHA_NONCES` e `ALPHA_STATUS_SNAPSHOT` (KV); quando forem provisionados pelo
ambiente, nonce e snapshot passam a ter TTL e persistência no KV automaticamente.
Antes de habilitar produção
multi-isolate, o próximo gate é provisionar e testar esse binding (ou uma tabela
D1 com consumo transacional), além de verificar replay sob concorrência.
## Nonces de prova de carteira

O endpoint `/api/wallet-proof` valida a assinatura antes de consumir o nonce e serializa tentativas do mesmo nonce dentro de cada isolate. Isso impede que uma assinatura inválida consuma o desafio legítimo no mesmo processo.

Proteção atômica entre múltiplos isolates ainda depende de um mecanismo com compare-and-set ou transação, como Durable Objects ou D1. O binding KV opcional não deve ser tratado como prova de atomicidade entre requests concorrentes até que essa integração seja provisionada e validada em staging.

O endpoint também aplica um limite local de 20 POSTs por minuto por endereço quando o runtime fornece `CF-Connecting-IP` ou `X-Forwarded-For`, além de rejeitar payloads acima de 16 KiB. Esse limite é uma defesa adicional por isolate, não substitui rate limiting distribuído na borda Cloudflare.
