import { DEMANDA_EXEMPLO, DEMANDA_VAZIA } from '../dominio/cadastroPadrao'
import type { Demanda } from '../dominio/tipos'

export interface ListaPOs {
  demandas: Demanda[]
  ativa: number
}

export function poAtiva(lista: ListaPOs): Demanda {
  return lista.demandas[lista.ativa] ?? lista.demandas[0]
}

export function adicionar(lista: ListaPOs, novas: Demanda[]): ListaPOs {
  if (novas.length === 0) return lista
  // o exemplo que vem aberto de início sai da frente se ninguém mexeu nele
  if (lista.demandas.length === 1 && JSON.stringify(lista.demandas[0]) === JSON.stringify(DEMANDA_EXEMPLO)) {
    return { demandas: novas, ativa: 0 }
  }
  return { demandas: [...lista.demandas, ...novas], ativa: lista.demandas.length }
}

export function novaPO(lista: ListaPOs): ListaPOs {
  return adicionar(lista, [{ ...structuredClone(DEMANDA_VAZIA), titulo: `PO-NOVA-${lista.demandas.length + 1}` }])
}

export function selecionar(lista: ListaPOs, indice: number): ListaPOs {
  return indice >= 0 && indice < lista.demandas.length ? { ...lista, ativa: indice } : lista
}

export function atualizarAtiva(lista: ListaPOs, demanda: Demanda): ListaPOs {
  return { ...lista, demandas: lista.demandas.map((d, i) => (i === lista.ativa ? demanda : d)) }
}

// a lista nunca fica vazia
export function remover(lista: ListaPOs, indice: number): ListaPOs {
  if (lista.demandas.length <= 1) return { demandas: [structuredClone(DEMANDA_VAZIA)], ativa: 0 }
  const demandas = lista.demandas.filter((_, i) => i !== indice)
  const ativa = lista.ativa > indice ? lista.ativa - 1 : Math.min(lista.ativa, demandas.length - 1)
  return { demandas, ativa }
}
