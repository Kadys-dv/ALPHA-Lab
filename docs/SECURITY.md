# Segurança e operação do ALPHA Lab

Este projeto é educacional e não substitui auditoria profissional.

## Regras adotadas

1. Nunca versionar chave privada ou seed phrase.
2. Usar uma carteira exclusiva para testnet.
3. Não enviar fundos reais para a carteira de testes.
4. Usar o Hardhat Keystore para a chave de deploy.
5. O contrato não possui mint administrativo, taxa, blacklist, pause ou proxy.
6. Testar localmente antes de Base Sepolia.
7. Confirmar sempre que a rede selecionada é Base Sepolia (chain ID 84532) antes do deploy.
8. Não anunciar rendimento, valorização, recompra ou retorno financeiro.
9. Não custodiar dinheiro ou tokens de usuários no laboratório.
10. Não criar liquidez, venda pública ou mainnet sem revisão específica.

## Segredos locais

- o Hardhat Keystore é local e não deve ser enviado ao repositório;
- a senha do keystore não é a senha do MetaMask;
- screenshots não devem incluir chave, seed phrase ou segredo revelado;
- o endereço público e o endereço do contrato podem ser documentados;
- em caso de exposição da chave, interromper o uso da carteira e criar outra exclusivamente para testnet.

## Gates para código novo

Qualquer distribuidor, sistema de recompensas ou aplicação deverá incluir:

- limites explícitos;
- proteção contra repetição e abuso;
- testes de autorização;
- eventos suficientes para auditoria;
- pausa operacional fora do token principal, quando necessária;
- revisão de ameaças antes do piloto.

O contrato ERC-20 principal não deverá receber funções administrativas apenas para facilitar experimentos.

## Se um dia houver mainnet

Criar uma revisão específica antes de qualquer deploy. A existência deste protótipo não significa que esteja aprovado para receber dinheiro real ou ser tratado como investimento.
