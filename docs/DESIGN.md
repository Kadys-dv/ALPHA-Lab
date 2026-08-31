# ALPHA v0.1 — desenho do token

## Objetivo

ALPHA é um laboratório de token utilitário para aprender ERC-20 e validar uma futura camada de acesso e recompensas de um produto digital.

## Propriedades

- Nome: Alpha
- Símbolo: ALPHA
- Padrão: ERC-20
- Decimais: 18
- Supply: 100.000.000 ALPHA
- Supply fixo: sim
- Mint após deploy: não
- Owner/admin: não
- Blacklist: não
- Pausa: não
- Taxa de transferência: não
- Upgrade/proxy: não
- Venda inicial: não
- Promessa de rendimento: não

## Distribuição na v0.1

O deployer recebe 100% do supply no momento do deploy. Em testnet, isso permite estudar transferências e premiar carteiras manualmente sem criar uma função de emissão posterior.

## Por que supply fixo?

É o modelo mais simples para aprender e reduz a superfície de risco. Não existe uma chave administrativa capaz de aumentar a quantidade total de ALPHA depois do deploy.

## Escopo atual

Somente ambiente local e Base Sepolia. Mainnet está fora do escopo da v0.1.

## Hipótese de utilidade

Antes de qualquer mainnet, ALPHA deverá provar pelo menos uma utilidade que funcione sem expectativa de valorização, como acesso a recurso digital, desconto, licença, participação em comunidade ou recompensa por contribuição verificável.

O token não representa participação societária, dívida, rendimento, dividendos ou direito sobre receita. Qualquer mudança nessa definição exige nova análise técnica e jurídica.

## Decisões que permanecem abertas

- público inicial do produto;
- problema específico que o produto resolverá;
- ação que gera recompensa;
- utilidade consumível ou recorrente de ALPHA;
- limites de distribuição e mecanismos antiabuso;
- experiência para usuários sem carteira cripto.

Essas decisões devem ser validadas fora do contrato principal. O ERC-20 publicado permanece simples e imutável durante a fase de descoberta.
