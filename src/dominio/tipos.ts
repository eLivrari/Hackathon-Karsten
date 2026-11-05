// Cadastros de apoio: a base que quase não muda (elementos MTM e máquinas).

export interface ElementoMTM {
  codigo: string // tipo "2.1": o grupo vem antes do ponto, o elemento depois
  descricao: string
  tempo: number // em minutos
}

export interface Maquina {
  codigo: string
  tipo: string // Interlock, Reta...
  modelo: string // Jack C4, Siruba...
  rpm: number
  tempoPorMetro: number // quantos minutos ela leva pra costurar 1 metro
}

export interface Cadastros {
  elementos: ElementoMTM[]
  maquinas: Maquina[]
}

// O que o usuário preenche para descrever uma operação.

export interface PassoRoteiro {
  codigo: string
  frequencia: number
}

export interface Demanda {
  titulo: string
  revisao: string
  operacao: string
  familia: string
  tamanho: string
  medidas: string
  pontosPorCm: number
  perimetro: number // em metros, não em cm
  codigoMaquina: string
  roteiro: PassoRoteiro[]
}

// O que sai do cálculo: a ficha de Processo Operacional (PO) pronta.

export interface LinhaPO {
  codigo: string
  descricao: string
  frequencia: number
  tempo: number // já vem multiplicado pela frequência, não precisa multiplicar de novo
  origem: 'fixo' | 'mtm'
  encontrado: boolean
}

export interface FichaPO {
  demanda: Demanda
  maquina?: Maquina
  rpm: { inferior: number; padrao: number; superior: number }
  linhas: LinhaPO[]
  tempoFixo: number
  tempoManual: number
  tempoTotal: number
  pecasPorHora: number
  avisos: string[]
}
