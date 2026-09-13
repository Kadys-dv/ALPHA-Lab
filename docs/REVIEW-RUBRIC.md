# Rubrica de revisão

Antes de aplicar a label `accepted`, um owner, member ou collaborator deve publicar na Issue um comentário exatamente neste formato:

```text
<!-- alpha-review -->
Contexto e objetivo: aprovado
Instalação reproduzível: aprovado
Decisões técnicas: ajustes necessários
Testes e validações: aprovado
Demonstração: não se aplica
Resultado: aprovado
Recomendação: Explique em uma frase a principal melhoria ou o próximo passo recomendado.
```

Valores permitidos para cada critério:

- `aprovado`
- `ajustes necessários`
- `não se aplica`

Valores permitidos para `Resultado`:

- `aprovado`
- `ajustes necessários`
- `reprovado`

A label `accepted` exige `Resultado: aprovado`. Se a rubrica estiver incompleta, tiver sido publicada por alguém sem permissão no repositório ou indicar outro resultado, o workflow remove o aceite e retorna a Issue para `under-review`.

A recomendação deve ser específica, acionável e limitada a 500 caracteres. Depois do aceite, a rubrica e o instante da decisão são preservados no corpo da Issue como registro público.
