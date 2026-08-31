# Roadmap de validação

## Fase 1 — base do projeto: concluída

- [x] ERC-20 ALPHA de supply fixo
- [x] testes Solidity
- [x] Hardhat 3 e OpenZeppelin Contracts
- [x] módulo de deploy Hardhat Ignition
- [x] configuração Base Sepolia
- [x] política básica de segurança

## Fase 2 — execução local: concluída

- [x] instalação reproduzível do contrato com `npm ci`
- [x] compilação Solidity 0.8.34
- [x] 18 invariantes de código/configuração
- [x] 7 testes Solidity
- [x] deploy local

## Fase 3 — Base Sepolia: concluída

- [x] carteira exclusiva de testes
- [x] ETH gratuito de testnet
- [x] deploy público
- [x] bytecode e metadados validados on-chain
- [x] supply inicial confirmado
- [x] endereço registrado na documentação

Contrato validado: `0xff15343aCcc4B77479EBE3C4cae32d99d4c60f48`.

## Fase 4 — descoberta de produto: em andamento

- [x] escolher desenvolvedores iniciantes como público
- [x] definir conclusão e apresentação de projetos como problema inicial
- [ ] entrevistar 20 usuários potenciais
- [x] escolher revisão estruturada de README como primeira utilidade
- [x] documentar hipótese inicial de distribuição e antiabuso
- [x] manter o contrato principal inalterado durante a descoberta

## Fase 5 — MVP do ALPHA Builders: concluída

- [x] publicar landing page
- [x] desafio de revisão estruturada de README
- [x] submissão real por GitHub Issue
- [x] carteira EVM com Base Sepolia sem transações financeiras
- [x] tratamento de carteira ausente, rede incorreta e cancelamento
- [x] avisos de testnet e ausência de valor financeiro

Site atual: https://alpha-builders.kadys-v2.chatgpt.site

## Fase 5.1 — fonte de verdade e qualidade: implementada

- [x] versionar fonte canônica do frontend em `web/`
- [x] manter Next.js/React/TypeScript/Framer Motion/R3F no repositório
- [x] adicionar CI de lint, TypeScript, testes, build e audit
- [x] adicionar smoke test do deploy público
- [x] adicionar endpoint `/api/version` para SHA de deploy
- [x] documentar limitação de rastreabilidade do host atual
- [ ] versionar `web/package-lock.json` gerado e validado pelo CI
- [ ] migrar o deploy futuro para uma hospedagem diretamente ligada ao repositório/commit

## Fase 6 — pipeline de contribuições: implementada tecnicamente

- [x] Issue Form de submissão
- [x] suporte ao formulário prefilled usado pelo site
- [x] validação automática de URL GitHub
- [x] confirmação de repositório público
- [x] verificação de README
- [x] validação de endereço EVM
- [x] labels `submission`, `valid`, `invalid`, `needs-review`, `under-review`, `accepted`
- [x] impedir aceite automático
- [x] seção pública de Builders aceitos
- [x] sanitizar os campos publicados
- [x] métricas públicas de submissões, revisão e aceite
- [ ] validar o workflow com submissões reais após merge na `main`

## Fase 6.1 — piloto com usuários

- [ ] obter 10 usuários ativos
- [ ] obter pelo menos 7 submissões concluídas
- [ ] medir taxa de conclusão
- [ ] medir tempo até revisão
- [ ] medir qualidade percebida da revisão de README
- [ ] validar repetição de uso por pelo menos 5 usuários
- [ ] decidir, com dados, se é necessário backend próprio

## Fase 7 — primeira receita

- [ ] oferecer serviço ou assinatura em reais
- [ ] obter 3 clientes pagantes sem vender ALPHA
- [ ] registrar receitas e custos
- [ ] documentar termos, privacidade, riscos e suporte
- [ ] reinvestir somente receita já recebida

## Gate anterior à mainnet

Mainnet continuará bloqueada até existirem produto funcional, utilidade comprovada, usuários reais, receita independente da especulação, revisão jurídica/tributária e orçamento sustentável para segurança e operação.

## Fora do escopo atual

- mainnet;
- venda pública do token;
- pool de liquidez;
- staking, dividendos ou rendimento;
- promessa de lucro, preço mínimo ou recompra;
- marketing baseado em escassez ou valorização futura;
- integração com outro projeto.
