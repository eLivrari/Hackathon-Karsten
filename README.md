# Auto-T&M Karsten

Calcula os tempos de uma operação de costura e gera a ficha de Processo Operacional (PO).

Online: https://elivrari.github.io/Hackathon-Karsten/

## Equipe

| Nome            | Papel      |
| --------------- | ---------- |
| Enzo Livrari    | Cálculos   |
| Guilherme Rozzi | Exportação |
| João Pedro      | Interface  |

## Como rodar

Precisa do Node 20+.

```bash
npm install
npm run dev
```

Testes (o cálculo é conferido com o gabarito do kit):

```bash
npm test
```

O deploy no GitHub Pages roda sozinho a cada push na `main`.

## Como usar

1. Em **Operação**, importe um arquivo (ods, xlsx, xls, txt, csv ou json) ou preencha os campos.
2. Em **Ficha PO**, confira os tempos e exporte para Excel.
3. Em **Análise**, compare as máquinas.
4. Em **Cadastros**, veja os elementos MTM e as máquinas.

Os dados ficam salvos no navegador.

## Cálculo

- Tempo fixo = perímetro (m) × tempo por metro da máquina
- Tempo manual = soma dos elementos MTM × frequência
- Tempo total = fixo + manual
- Peças/hora = 60 ÷ tempo total
