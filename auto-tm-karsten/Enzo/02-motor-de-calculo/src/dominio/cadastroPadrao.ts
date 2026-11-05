import type { Cadastros, Demanda } from './tipos'

// Esses dados foram copiados do kit oficial (Entradas.ods) só pra o sistema
// já abrir com alguma coisa e não começar vazio. Se carregar outra planilha,
// ela substitui tudo isso sem problema.

export const CADASTRO_PADRAO: Cadastros = {
  elementos: [
    { codigo: '1.1', descricao: 'Costurar Elemento (sem tempo)', tempo: 0 },
    { codigo: '2.1', descricao: 'Apanhar peça e posicionar na mesa', tempo: 0.15 },
    { codigo: '2.2', descricao: 'Apanhar, posicionar e costurar etiqueta', tempo: 0.2 },
    { codigo: '2.3', descricao: 'Apanhar a outra extremidade da peça', tempo: 0.3 },
    { codigo: '3.1', descricao: 'Ajeitar peça', tempo: 0.12 },
    { codigo: '4.1', descricao: 'Dobrar duas vezes para fazer o inicio da bainha', tempo: 0.4 },
    { codigo: '5.1', descricao: 'Posicionar no calcador ajustando a peça no aparelho', tempo: 0.35 },
    { codigo: '5.2', descricao: 'Posicionar o elástico embutindo na bainha', tempo: 0.1 },
    { codigo: '6.1', descricao: 'Cortar para separar', tempo: 0.25 },
  ],
  maquinas: [
    { codigo: '1', tipo: 'Interlock', modelo: 'Jack C4', rpm: 5000, tempoPorMetro: 0.0964 },
    { codigo: '2', tipo: 'Interlock', modelo: 'Siruba', rpm: 5000, tempoPorMetro: 0.0835 },
    { codigo: '3', tipo: 'Reta', modelo: 'Jack A5', rpm: 5000, tempoPorMetro: 0.0972 },
  ],
}

// O cenário de teste oficial (demanda_000.txt). Bom pra conferir se a conta bate com o gabarito.
export const DEMANDA_EXEMPLO: Demanda = {
  titulo: 'PO-SL-001',
  revisao: '00',
  operacao: 'Bainhar no corpo do SL - 1 lado',
  familia: 'Sobre-lençol',
  tamanho: 'Solteiro',
  medidas: '1,80 x 2,50',
  pontosPorCm: 2.5,
  perimetro: 6.96,
  codigoMaquina: '1',
  roteiro: [
    { codigo: '2.1', frequencia: 1 },
    { codigo: '1.1', frequencia: 1 },
    { codigo: '3.1', frequencia: 1 },
  ],
}

// Ponto de partida quando o usuário quer montar uma demanda do zero.
export const DEMANDA_VAZIA: Demanda = {
  titulo: 'PO-NOVA',
  revisao: '00',
  operacao: '',
  familia: '',
  tamanho: '',
  medidas: '',
  pontosPorCm: 0,
  perimetro: 0,
  codigoMaquina: '1',
  roteiro: [],
}
