export type Tela = 'operacao' | 'ficha' | 'analise' | 'cadastros'

interface ItemMenu {
  id: Tela
  label: string
  numero: string
  icone: string
  titulo: string
  descricao: string
}

export const MENU: ItemMenu[] = [
  {
    id: 'operacao',
    label: 'Operação',
    numero: '01',
    icone: '⌁',
    titulo: 'Nova operação',
    descricao: 'Configure a operação e confira os parâmetros antes de calcular.',
  },
  {
    id: 'ficha',
    label: 'Ficha PO',
    numero: '02',
    icone: '▤',
    titulo: 'Ficha operacional',
    descricao: 'Resumo calculado da operação, pronto para revisar e exportar.',
  },
  {
    id: 'analise',
    label: 'Análise',
    numero: '03',
    icone: '↗',
    titulo: 'Análise de eficiência',
    descricao: 'Compare o desempenho estimado entre as máquinas disponíveis.',
  },
  {
    id: 'cadastros',
    label: 'Cadastros',
    numero: '04',
    icone: '▦',
    titulo: 'Base de cadastros',
    descricao: 'Consulte os elementos MTM e os equipamentos usados nos cálculos.',
  },
]

export function itemDaTela(tela: Tela) {
  return MENU.find((item) => item.id === tela) ?? MENU[0]
}
