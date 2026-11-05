import type { Demanda, ElementoMTM, Maquina } from '../dominio/tipos'
import { lerPlanilha } from './planilha'
import { lerDemandaJson, lerDemandaTexto } from './texto'

export interface Leitura {
  arquivo: string
  elementos: ElementoMTM[]
  maquinas: Maquina[]
  demandas: Demanda[]
}

const PLANILHAS = ['ods', 'xlsx', 'xls']

/**
 * Porta de entrada única: o usuário solta qualquer arquivo do kit
 * e a gente descobre o que tem dentro.
 */
export async function lerArquivo(arquivo: File): Promise<Leitura> {
  const extensao = arquivo.name.split('.').pop()?.toLowerCase() ?? ''
  const base = { arquivo: arquivo.name, elementos: [], maquinas: [], demandas: [] }

  if (PLANILHAS.includes(extensao)) {
    return { ...base, ...lerPlanilha(await arquivo.arrayBuffer()) }
  }

  const conteudo = await arquivo.text()
  return { ...base, demandas: lerConteudoTexto(conteudo) }
}

/** Usado tanto para arquivos .txt/.csv/.json quanto para o "colar texto" */
export function lerConteudoTexto(conteudo: string): Demanda[] {
  const limpo = conteudo.trim()
  if (limpo.startsWith('{') || limpo.startsWith('[')) return lerDemandaJson(limpo)
  return lerDemandaTexto(limpo)
}
