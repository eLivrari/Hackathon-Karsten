import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { CADASTRO_PADRAO, DEMANDA_EXEMPLO } from '../dominio/cadastroPadrao'
import { lerPlanilha } from './planilha'
import { lerDemandaJson, lerDemandaTexto, lerRoteiro, numeroBR } from './texto'

const exemplo = (arquivo: string) => readFileSync(new URL(`../../public/exemplos/${arquivo}`, import.meta.url))

describe('leitura de texto', () => {
  it('entende número no formato brasileiro', () => {
    expect(numeroBR('2,50')).toBe(2.5)
    expect(numeroBR('1.234,5')).toBe(1234.5)
    expect(numeroBR(6.96)).toBe(6.96)
  })

  it('lê o roteiro em vários formatos', () => {
    expect(lerRoteiro('2.1, 1.1, 3.1').map((p) => p.codigo)).toEqual(['2.1', '1.1', '3.1'])
    expect(lerRoteiro('2,1; 3,1')).toEqual([
      { codigo: '2.1', frequencia: 1 },
      { codigo: '3.1', frequencia: 1 },
    ])
    expect(lerRoteiro('2.1 x2')).toEqual([{ codigo: '2.1', frequencia: 2 }])
  })

  it('lê o demanda_000.txt oficial', () => {
    const [demanda] = lerDemandaTexto(exemplo('demanda_000.txt').toString('utf-8'))
    expect(demanda).toEqual(DEMANDA_EXEMPLO)
  })

  it('separa várias demandas no mesmo arquivo', () => {
    const txt = 'Título: A\nPerímetro: 1\nElementos: 2.1\n\nTítulo: B\nPerímetro: 2\nElementos: 3.1'
    expect(lerDemandaTexto(txt).map((d) => d.titulo)).toEqual(['A', 'B'])
  })

  it('lê JSON exportado pelo próprio sistema', () => {
    const [demanda] = lerDemandaJson(JSON.stringify(DEMANDA_EXEMPLO))
    expect(demanda).toEqual(DEMANDA_EXEMPLO)
  })
})

describe('leitura de planilha', () => {
  it('carrega MATRIZ DE ELEMENTOS e TEMPO-CM do Entradas.ods', () => {
    const { elementos, maquinas } = lerPlanilha(exemplo('Entradas.ods'))
    expect(elementos).toEqual(CADASTRO_PADRAO.elementos)
    expect(maquinas).toEqual(CADASTRO_PADRAO.maquinas)
  })

  it('reabre a PO gabarito como demanda', () => {
    const { demandas } = lerPlanilha(exemplo('PO-SL-000-gabarito.ods'))
    expect(demandas[0]).toEqual(DEMANDA_EXEMPLO)
  })
})
