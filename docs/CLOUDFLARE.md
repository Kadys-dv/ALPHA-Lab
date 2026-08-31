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
