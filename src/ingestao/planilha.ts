import * as XLSX from 'xlsx'
import type { Demanda, ElementoMTM, Maquina } from '../dominio/tipos'
import { DEMANDA_VAZIA } from '../dominio/cadastroPadrao'
import { chave, lerRoteiro, numeroBR } from './texto'

type Linha = unknown[]

const texto = (v: unknown) => String(v ?? '').trim()

/** Procura a linha de cabeçalho que contém a coluna indicada */
function acharCabecalho(linhas: Linha[], coluna: string) {
  return linhas.findIndex((l) => l.some((c) => chave(c).startsWith(coluna)))
}

function indiceColuna(cabecalho: Linha, prefixo: string) {
  return cabecalho.findIndex((c) => chave(c).startsWith(prefixo))
}

// Aba MATRIZ DE ELEMENTOS — detectada pelo conteúdo, não pelo nome da aba
function lerElementos(linhas: Linha[]): ElementoMTM[] {
  const i = acharCabecalho(linhas, 'descricaodoelemento')
  if (i < 0) return []
  const cab = linhas[i]
  const col = {
    descricao: indiceColuna(cab, 'descricaodoelemento'),
    agrupador: indiceColuna(cab, 'codigodoagrupador'),
    elemento: indiceColuna(cab, 'codigodoelemento'),
    tempo: cab.findIndex((c) => chave(c) === 'tempo'),
  }

  return linhas
    .slice(i + 1)
    .filter((l) => texto(l[col.descricao]))
    .map((l) => ({
      codigo: `${texto(l[col.agrupador])}.${texto(l[col.elemento])}`,
      descricao: texto(l[col.descricao]),
      tempo: numeroBR(l[col.tempo]),
    }))
}

// Aba TEMPO-CM
function lerMaquinas(linhas: Linha[]): Maquina[] {
  const i = acharCabecalho(linhas, 'codigodemaquina')
  if (i < 0) return []
  const cab = linhas[i]
  const col = {
    codigo: indiceColuna(cab, 'codigodemaquina'),
    tipo: indiceColuna(cab, 'tipo'),
    modelo: indiceColuna(cab, 'descricao'),
    rpm: indiceColuna(cab, 'rpm'),
    tempo: indiceColuna(cab, 'tempo'),
  }

  return linhas
    .slice(i + 1)
    .filter((l) => texto(l[col.codigo]))
    .map((l) => ({
      codigo: texto(l[col.codigo]),
      tipo: texto(l[col.tipo]),
      modelo: texto(l[col.modelo]),
      rpm: numeroBR(l[col.rpm]),
      tempoPorMetro: numeroBR(l[col.tempo]),
    }))
}

// Uma PO já pronta (gabarito ou exportada por nós) também serve de entrada:
// dá pra reabrir uma ficha antiga, trocar a máquina e gerar a revisão.
function lerFichaPO(linhas: Linha[]): Demanda | null {
  const iProduto = acharCabecalho(linhas, 'agrupamentofamilia')
  const iEquip = acharCabecalho(linhas, 'codeqp')
  const iElementos = acharCabecalho(linhas, 'codigodoelemento')
  if (iProduto < 0 || iEquip < 0 || iElementos < 0) return null

  const produto = linhas[iProduto + 1] ?? []
  const operacao = linhas.find((l) => chave(l[0]) === 'operacao')
  const codigos = linhas
    .slice(iElementos + 1)
    .filter((l) => /^\d+\.\d+$/.test(texto(l[0])))
    .map((l) => `${texto(l[0])}x${numeroBR(l[3]) || 1}`)

  return {
    ...structuredClone(DEMANDA_VAZIA),
    titulo: texto(linhas[0]?.[0]),
    revisao: texto((linhas[0] ?? []).find((c) => /rev/i.test(texto(c))))
      .replace(/rev\.?/i, '')
      .trim(),
    operacao: texto(operacao?.[1]),
    familia: texto(produto[0]),
    tamanho: texto(produto[1]),
    medidas: texto(produto[2]),
    pontosPorCm: numeroBR(produto[3]),
    perimetro: numeroBR(produto[4]),
    codigoMaquina: texto(linhas[iEquip + 1]?.[0]),
    roteiro: lerRoteiro(codigos.join(', ')),
  }
}

export function lerPlanilha(conteudo: ArrayBuffer | Uint8Array) {
  const pasta = XLSX.read(conteudo, { type: 'array' })
  const elementos: ElementoMTM[] = []
  const maquinas: Maquina[] = []
  const demandas: Demanda[] = []

  for (const nome of pasta.SheetNames) {
    const linhas = XLSX.utils.sheet_to_json<Linha>(pasta.Sheets[nome], { header: 1, defval: '' })
    elementos.push(...lerElementos(linhas))
    maquinas.push(...lerMaquinas(linhas))
    const po = lerFichaPO(linhas)
    if (po) demandas.push(po)
  }

  return { elementos, maquinas, demandas }
}
