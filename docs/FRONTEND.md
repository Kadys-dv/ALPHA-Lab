# ALPHA Builders — frontend publicado

## URL pública

https://alpha-builders.kadys-v2.chatgpt.site

## Estado conhecido

O ALPHA Builders publicado representa a primeira implementação funcional da hipótese de produto descrita em `docs/PRODUCT.md`.

Características já implementadas e validadas no ambiente publicado:

- identidade visual neo-brutalista com Aurora Bloom;
- elemento 3D interativo com Three.js / React Three Fiber;
- animações de rolagem com Framer Motion;
- layout responsivo para celular, tablet e desktop;
- conexão com carteiras EVM;
- inclusão e troca para Base Sepolia;
- tratamento de carteira ausente, rede errada e conexão cancelada;
- métricas públicas do contrato;
- cópia do endereço do contrato;
- desafio de revisão estruturada de README;
- validação de URLs do GitHub;
- submissão por abertura real de GitHub Issue;
- redução de animações/3D em dispositivos limitados;
- avisos de testnet e ausência de valor financeiro.

## Restrições preservadas

O frontend não deve habilitar:

- Base Mainnet;
- compra ou venda de ALPHA;
- transferência de ativos;
- `approve` ou `permit`;
- swap, bridge ou staking;
- assinatura de transações financeiras;
- promessa de preço, lucro, rendimento ou valorização.

## Lacuna de versionamento

Na data desta documentação, o código-fonte exato do frontend publicado não está armazenado neste repositório `ALPHA-Lab`.

Por isso, esta documentação descreve o estado funcional conhecido, mas não substitui o código-fonte. A consolidação só estará completa quando a versão exata publicada for importada e cada deploy puder ser relacionado a um commit ou tag.

Não é recomendável reconstruir o site a partir dos bundles compilados do ambiente publicado, porque isso não preservaria a fonte original, histórico de desenvolvimento, nomes de componentes, testes ou configuração de build.

## Estrutura recomendada após a importação

Se o frontend for mantido neste mesmo repositório, a estrutura preferida é:

```text
ALPHA-Lab/
  contracts/
  docs/
  ignition/
  scripts/
  web/
    app/
    components/
    hooks/
    lib/
    public/
    tests/
    package.json
    package-lock.json
```

A alternativa aceitável é um repositório oficial separado, desde que o README deste projeto aponte explicitamente para ele e os deploys permaneçam rastreáveis por commit.

## CI mínimo esperado para o frontend

Depois da importação do código-fonte, o CI deve executar de forma reproduzível:

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm audit --omit=dev
```

Os nomes reais dos scripts devem seguir o `package.json` importado. O workflow não deve ser criado com comandos fictícios antes de o código-fonte estar disponível.

## Próximos gates

1. importar a fonte exata da versão publicada;
2. registrar o primeiro commit/tag correspondente ao deploy atual;
3. criar CI do frontend;
4. executar smoke test contra a URL pública;
5. validar eventos `accountsChanged`, `chainChanged` e `disconnect`;
6. revisar a sanitização dos dados usados para compor GitHub Issues;
7. só então expandir o pipeline de contribuições.
