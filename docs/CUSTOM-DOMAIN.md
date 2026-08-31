# Domínio próprio

O ALPHA Builders está pronto para receber um domínio próprio sem alterar a aplicação.

## Estado

- origem canônica atual: `alpha-builders-web.cskadys.workers.dev`;
- Worker: `alpha-builders-web`;
- HTTPS gerenciado pelo Cloudflare;
- metadata, sitemap, robots e smoke já centralizados para produção.

## Ativação

A configuração final depende de um domínio que o proprietário controle no Cloudflare. Não deve ser inventado ou registrado automaticamente.

Quando houver domínio escolhido:
1. adicionar Custom Domain/Route ao Worker `alpha-builders-web`;
2. atualizar `metadataBase`, canonical e sitemap;
3. atualizar `PRODUCTION_URL` nos workflows de smoke/deploy;
4. validar HTTPS, `/api/version`, `/api/status`, OG image e redirects;
5. manter o `workers.dev` como fallback técnico durante a propagação.

O domínio não altera o contrato nem o escopo Base Sepolia.
