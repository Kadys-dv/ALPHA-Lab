# ALPHA v0.1 — desenho do token

## Objetivo

ALPHA é um projeto educacional independente para aprender ERC-20, carteiras, transações, deploy e redes de teste.

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
