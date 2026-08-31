# ALPHA Builders — métricas

A validação do produto deve priorizar comportamento de usuários e qualidade das contribuições, não quantidade de tokens.

## Métricas principais

1. **Submissões públicas** — Issues com label `submission`.
2. **Em revisão** — Issues com label `under-review`.
3. **Aceitas** — Issues com label `accepted`, sempre após revisão humana.
4. **Taxa de conclusão** — usuários que iniciam o desafio e efetivamente submetem.
5. **Tempo até revisão** — intervalo entre abertura da Issue e decisão humana.
6. **Repetição de uso** — Builders que retornam para uma nova entrega.
7. **Qualidade percebida** — feedback dos participantes sobre utilidade da revisão.

## Fontes

- `GITHUB`: estados das Issues e contribuições.
- `ON_CHAIN`: somente fatos do contrato, como supply e bytecode.
- `STATIC`: Chain ID, endereço do contrato e versão de aplicação.

Nenhum contador deve ser inventado ou incrementado localmente para simular adoção.
