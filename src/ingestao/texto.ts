import type { Demanda, PassoRoteiro } from '../dominio/tipos'
import { DEMANDA_VAZIA } from '../dominio/cadastroPadrao'

/** "2,50" → 2.5 · "1.234,5" → 1234.5 · 6.96 → 6.96 */
export function numeroBR(valor: unknown): number {
  if (typeof valor === 'number') return valor
  let texto = String(valor ?? '')
    .trim()
    .replace(/\s/g, '')
  if (!texto) return 0
  if (texto.includes(',')) texto = texto.replace(/\./g, '').replace(',', '.')
  const numero = Number(texto)
  return Number.isFinite(numero) ? numero : 0
}

/** Deixa o nome do campo comparável: sem acento, minúsculo, sem "(em m)" etc. */
export function chave(texto: unknown) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z/]/g, '')
}

/**
 * Lê a sequência de elementos. Aceita:
 *   "2.1, 1.1, 3.1"   "2.1 x2, 3.1"   "2,1; 1,1; 3,1"
 * O sufixo "x2" (ou "*2") vira frequência.
 */
export function lerRoteiro(texto: string): PassoRoteiro[] {
  const normalizado = texto.includes(';') ? texto.replace(/,/g, '.') : texto
  return [...normalizado.matchAll(/(\d+\.\d+)(?:\s*[x*]\s*(\d+))?/gi)].map((m) => ({
    codigo: m[1],
    frequencia: m[2] ? Number(m[2]) : 1,
  }))
}

type Aplicar = (demanda: Demanda, valor: string) => void

// Cada campo aceita vários apelidos (txt do kit, JSON camelCase, CSV de planilha...)
const CAMPOS: Array<[string[], Aplicar]> = [
  [['titulo'], (d, v) => (d.titulo = v)],
  [['rev'], (d, v) => (d.revisao = v.replace(/rev\.?/i, '').trim())],
  [['operacao'], (d, v) => (d.operacao = v)],
  [['agrupamento', 'familia'], (d, v) => (d.familia = v)],
  [['tamanho'], (d, v) => (d.tamanho = v)],
  [['medida'], (d, v) => (d.medidas = v)],
  [['pontos'], (d, v) => (d.pontosPorCm = numeroBR(v))],
  [['perimetro', 'comprimento'], (d, v) => (d.perimetro = numeroBR(v))],
  [['codeqp', 'codigomaquina', 'codigodemaquina', 'maquina', 'equipamento'], (d, v) => (d.codigoMaquina = v)],
  [['elementos', 'roteiro', 'sequencia'], (d, v) => (d.roteiro = lerRoteiro(v))],
]

function aplicarCampo(demanda: Demanda, nome: string, valor: string) {
  const k = chave(nome)
  const campo = CAMPOS.find(([apelidos]) => apelidos.some((a) => k.startsWith(a)))
  campo?.[1](demanda, valor.trim().replace(/^["']|["']$/g, ''))
  return Boolean(campo)
}

/**
 * Formato do kit: uma linha por campo, "Chave: valor".
 * Também aceita "=", ";" ou TAB como separador (CSV de duas colunas).
 * Vários "Título:" no mesmo arquivo = várias demandas (lote).
 */
export function lerDemandaTexto(texto: string): Demanda[] {
  const demandas: Demanda[] = []
  let atual: Demanda | null = null

  for (const linha of texto.split(/\r?\n/)) {
    const partes = linha.match(/^\s*([^:=;\t]+?)\s*[:=;\t]\s*(.*)$/)
    if (!partes) continue
    const [, nome, valor] = partes

    if (chave(nome).startsWith('titulo') || !atual) {
      atual = structuredClone(DEMANDA_VAZIA)
      demandas.push(atual)
    }
    aplicarCampo(atual, nome, valor)
  }

  return demandas.filter((d) => d.roteiro.length > 0 || d.perimetro > 0)
}

/** JSON: um objeto ou uma lista. Reaproveita o leitor de texto campo a campo. */
export function lerDemandaJson(texto: string): Demanda[] {
  const dados = JSON.parse(texto)
  const lista: Record<string, unknown>[] = Array.isArray(dados) ? dados : [dados]

  return lista.map((obj) => {
    const demanda = structuredClone(DEMANDA_VAZIA)
    for (const [nome, valor] of Object.entries(obj)) {
      if (Array.isArray(valor)) {
        // roteiro pode vir como ["2.1", "1.1"] ou [{ codigo, frequencia }]
        const texto = valor
          .map((p) => (typeof p === 'object' ? `${p.codigo}x${p.frequencia ?? 1}` : String(p)))
          .join(', ')
        aplicarCampo(demanda, nome, texto)
      } else {
        aplicarCampo(demanda, nome, String(valor))
      }
    }
    return demanda
  })
}
