# ALPHA Builders — métricas

As métricas validam comportamento e qualidade do serviço. Quantidade de tokens não é indicador de sucesso.

## Dicionário

| Métrica | Fórmula | Fonte | Meta | Limitação |
|---|---|---|---:|---|
| Participantes iniciados | autores únicos de Issues `pilot-started` | GitHub | 10 | exige que o participante registre o início |
| Submissões | Issues `submission` | GitHub | 7 | uma pessoa pode submeter mais de uma vez |
| Taxa de conclusão | participantes iniciados que submeteram / participantes iniciados | GitHub | 70% | usa o login público do GitHub |
| Desistências observadas | iniciados sem submissão | GitHub | acompanhar | pode subestimar quem não registrou o início |
| Taxa de aceite | aceitas / submissões | GitHub | diagnóstico | não é taxa de conclusão |
| Builders recorrentes | carteiras com mais de uma aceitação | GitHub | 5 | depende da prova de controle da carteira |
| Tempo de revisão | aceite registrado − criação da submissão | GitHub | SLA 48h | aceitações legadas sem marcador são excluídas |
| Qualidade percebida | respostas `sim` para revisão útil / feedbacks | GitHub | aprender | autorrelato, não prova causalidade |
| Aplicação da recomendação | respostas `sim` para aplicação / feedbacks | GitHub | aprender | autorrelato |
| Intenção de repetir | respostas `sim` para novo ciclo / feedbacks | GitHub | aprender | intenção não equivale a comportamento |
| Disposição de pagar | feedbacks com resposta `sim` | GitHub | 3 | não equivale a receita recebida |

Quando o denominador não existe ou a fonte falha, o valor é `null` e a interface mostra `—`. O sistema nunca substitui ausência de evidência por zero.

## Rubrica

Cada contribuição aceita contém cinco critérios: contexto, instalação, decisões técnicas, testes e demonstração. O painel agrega:

- quantidade medida por critério;
- quantidade aprovada;
- quantidade marcada como `ajustes necessários`;
- principais lacunas ordenadas pelo número de ajustes.

Itens `não se aplica` não entram no denominador qualitativo.

## Prazo de revisão

- primeira decisão humana: até 48 horas após a submissão;
- mediana: comportamento típico do serviço;
- percentil 90: experiência dos casos mais lentos;
- média: mantida para comparação, mas não usada isoladamente.

## Eventos públicos

1. O participante abre o formulário `Iniciar ciclo ALPHA Builders`.
2. A contribuição produz uma Issue `submission` com prova de carteira.
3. A revisão humana usa a rubrica padronizada.
4. O aceite registra data, critérios, recomendação e revisor.
5. O participante abre o formulário `Feedback do ciclo ALPHA Builders`.

Os formulários não devem conter e-mail, documento, chave privada, seed phrase ou outros dados pessoais sensíveis.

## Disponibilidade

`/api/status` consulta cinco fontes paginadas: início, submissão, revisão, aceite e feedback. Cada chamada tem timeout de oito segundos e cache público de cinco minutos.

`GITHUB_TOKEN` pode ser configurado somente no ambiente do servidor para elevar o limite da API. Ele nunca deve usar prefixo `NEXT_PUBLIC_`, aparecer no frontend ou ser versionado.

## Gate de decisão

Depois de 30 dias:

- continuar com pelo menos 7 entregas, utilidade percebida e sinais de repetição ou pagamento;
- ajustar quando houver participação, mas baixa conclusão ou baixa aplicação das recomendações;
- interromper quando houver menos de 5 entregas e nenhum sinal de problema prioritário.

Nenhuma métrica autoriza mainnet, venda de ALPHA ou promessa financeira.
