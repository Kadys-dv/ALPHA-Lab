# ALPHA na Base Sepolia — Fase 3

Esta fase publica a ALPHA somente em uma rede pública de testes. Não usa Base Mainnet nem dinheiro real.

## Primeiro deploy público validado

- Data: 2026-08-31
- Rede: Base Sepolia
- Chain ID: `84532`
- Contrato ALPHA: `0xff15343aCcc4B77479EBE3C4cae32d99d4c60f48`
- Deployer: `0xdb854d4D76a213740621e0dFa48de9BF7836c273`
- Bytecode publicado: `1793 bytes`
- Nome: `Alpha`
- Símbolo: `ALPHA`
- Decimais: `18`
- Supply: `100000000000000000000000000`
- Distribuição inicial: `100%` para o deployer

Explorer:

```text
https://sepolia.basescan.org/address/0xff15343aCcc4B77479EBE3C4cae32d99d4c60f48
```

## Rede permitida

- Rede: Base Sepolia
- Chain ID: `84532`
- RPC público: `https://sepolia.base.org`
- Explorer: `https://sepolia-explorer.base.org`

A configuração do projeto não deve adicionar Base Mainnet durante esta fase.

## 1. Crie uma carteira dedicada a testes

Use MetaMask, Coinbase Wallet ou outra carteira EVM, mas crie uma conta/endereço dedicado ao ALPHA Lab.

Regras:

- não use uma carteira que guarde fundos reais;
- nunca envie seed phrase ou chave privada pelo chat;
- nunca grave a chave em README, issue, commit, `.env` versionado ou GitHub Actions;
- anote apenas o endereço público `0x...` para verificações.

## 2. Confirme a Base Sepolia

No projeto atualizado:

```bash
npm ci
npm run preflight:base-sepolia
```

Para também consultar o saldo público da carteira:

```bash
npm run preflight:base-sepolia -- 0xSEU_ENDERECO_PUBLICO
```

O comando deve confirmar `chainId=84532`.

## 3. Obtenha ETH de teste gratuitamente

Use somente faucets de Base Sepolia indicados pela documentação oficial da Base:

https://docs.base.org/get-started/deploy-smart-contracts

O ETH recebido na testnet não é dinheiro real e serve apenas para pagar o gas de teste.

Depois, repita:

```bash
npm run preflight:base-sepolia -- 0xSEU_ENDERECO_PUBLICO
```

Não avance enquanto o saldo for zero.

## 4. Armazene a chave de forma criptografada

O projeto usa `configVariable("BASE_SEPOLIA_PRIVATE_KEY")`. Com Hardhat 3 + Toolbox, salve a chave no Hardhat Keystore:

```bash
npx hardhat keystore set BASE_SEPOLIA_PRIVATE_KEY
```

O Hardhat solicitará o segredo de forma interativa. Não coloque a chave na linha de comando.

Para confirmar apenas que a variável existe:

```bash
npx hardhat keystore list
```

Evite `keystore get` em gravações de tela ou terminais compartilhados, pois esse comando acessa o valor do segredo.

## 5. Revalide tudo localmente

Antes de qualquer transação de testnet:

```bash
npm run validate
```

Isso deve passar guard, compilação, testes Solidity e deploy local efêmero.

## 6. Deploy na Base Sepolia

Somente depois das etapas anteriores:

```bash
npm run deploy:base-sepolia
```

O Hardhat Ignition solicitará a senha do keystore quando precisar resolver a chave.

Registre somente informações públicas:

- endereço do contrato;
- hash da transação;
- endereço público da carteira deployer.

Nunca registre a chave privada ou seed phrase.

## 7. Validação on-chain

Imediatamente após o deploy e antes de transferir ALPHA:

```bash
npm run verify:base-sepolia -- 0xCONTRATO 0xDEPLOYER
```

O verificador exige:

- chain ID 84532;
- bytecode existente;
- `name() == "Alpha"`;
- `symbol() == "ALPHA"`;
- `decimals() == 18`;
- `totalSupply() == 100.000.000 * 10^18`;
- deployer com 100% do supply inicial, quando o endereço for informado.

Depois que ALPHA for transferida, omita o segundo endereço se quiser repetir somente as invariantes do token:

```bash
npm run verify:base-sepolia -- 0xCONTRATO
```

## 8. Transferência de teste

Depois da validação inicial, envie uma pequena quantidade de ALPHA para uma segunda carteira de teste e confirme a transação no explorer.

Essa etapa prova que o ERC-20 funciona em uma rede pública sem transformar o projeto em ativo de investimento ou usar fundos reais.

## Fora de escopo

Nesta fase não haverá:

- Base Mainnet;
- compra ou venda de ALPHA;
- pool de liquidez;
- promessa de valorização;
- custódia de fundos de terceiros;
- chave privada em GitHub Actions;
- gasto com auditoria ou serviços jurídicos.
