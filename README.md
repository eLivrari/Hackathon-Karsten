# Auto-T&M Karsten

Aplicação web para apoiar o cálculo de tempos operacionais e a geração de fichas de Processo Operacional (PO).

## Requisitos

- Node.js 20 ou superior
- npm

## Instalação e execução

```bash
npm install
npm run dev
```

O Vite exibirá o endereço local para abrir no navegador. Para gerar a versão de produção:

```bash
npm run build
npm run preview
```

## Fluxo da aplicação

1. Em **Operação**, carregue uma planilha `.ods`, `.xlsx` ou `.xls`, um arquivo `.txt`, `.csv` ou `.json`, ou informe os dados manualmente.
2. Confira os dados do produto, selecione a máquina e ajuste a sequência dos códigos MTM.
3. Abra **Ficha PO** para revisar os tempos calculados e exportar a ficha em Excel.
4. Use **Análise** para comparar a produção estimada nas máquinas cadastradas.
5. Consulte **Cadastros** para revisar elementos MTM e parâmetros das máquinas carregados na sessão.

## Cálculos

- Tempo fixo = perímetro de costura (m) × tempo da máquina por metro (min/m).
- Tempo manual = soma do tempo unitário de cada elemento MTM × sua frequência.
- Tempo total = tempo fixo + tempo manual.
- Produção estimada = 60 ÷ tempo total (peças/hora).

Os dados de exemplo do projeto são usados inicialmente para a demonstração. Os cadastros importados substituem os cadastros correspondentes durante a sessão atual.
