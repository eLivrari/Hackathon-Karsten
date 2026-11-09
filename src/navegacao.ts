export type Tela = 'operacao' | 'ficha' | 'analise' | 'cadastros'

interface ItemMenu {
  id: Tela
  label: string
  titulo: string
  descricao: string
}

export const MENU: ItemMenu[] = [
  {
    id: 'operacao',
    label: 'Operação',
    titulo: 'Operação',
    descricao: 'Dados do produto, máquina e sequência de elementos. O cálculo atualiza enquanto você digita.',
  },
  {
    id: 'ficha',
    label: 'Ficha PO',
    titulo: 'Ficha de processo operacional',
    descricao: 'Confira os tempos antes de exportar para Excel, PDF ou JSON.',
  },
  {
    id: 'analise',
    label: 'Análise',
    titulo: 'Comparação de máquinas',
    descricao: 'O mesmo produto e roteiro calculados com cada máquina cadastrada.',
  },
  {
    id: 'cadastros',
    label: 'Cadastros',
    titulo: 'Cadastros',
    descricao: 'Elementos MTM e máquinas usados no cálculo.',
  },
]

export function itemDaTela(tela: Tela) {
  return MENU.find((item) => item.id === tela) ?? MENU[0]
}
