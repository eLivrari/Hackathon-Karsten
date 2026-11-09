import { describe, expect, it } from 'vitest'
import { DEMANDA_EXEMPLO } from '../dominio/cadastroPadrao'
import type { Demanda } from '../dominio/tipos'
import { adicionar, atualizarAtiva, novaPO, poAtiva, remover, selecionar, type ListaPOs } from './listaPOs'

const po = (titulo: string): Demanda => ({ ...DEMANDA_EXEMPLO, titulo })
const tres: ListaPOs = { demandas: [po('A'), po('B'), po('C')], ativa: 1 }
const titulos = (l: ListaPOs) => l.demandas.map((d) => d.titulo)

describe('várias POs abertas', () => {
  it('adiciona no fim e seleciona a primeira nova', () => {
    const l = adicionar(tres, [po('D'), po('E')])
    expect(titulos(l)).toEqual(['A', 'B', 'C', 'D', 'E'])
    expect(poAtiva(l).titulo).toBe('D')
  })

  it('substitui o exemplo inicial se ele não foi alterado', () => {
    const inicial = { demandas: [DEMANDA_EXEMPLO], ativa: 0 }
    expect(titulos(adicionar(inicial, [po('X')]))).toEqual(['X'])
    const editado = { demandas: [{ ...DEMANDA_EXEMPLO, perimetro: 5 }], ativa: 0 }
    expect(titulos(adicionar(editado, [po('X')]))).toEqual(['PO-SL-001', 'X'])
  })

  it('não muda nada ao adicionar lista vazia', () => {
    expect(adicionar(tres, [])).toBe(tres)
  })

  it('nova PO vem em branco e numerada', () => {
    const l = novaPO(tres)
    expect(poAtiva(l).titulo).toBe('PO-NOVA-4')
    expect(poAtiva(l).roteiro).toEqual([])
  })

  it('edita só a PO ativa', () => {
    const l = atualizarAtiva(tres, po('B2'))
    expect(titulos(l)).toEqual(['A', 'B2', 'C'])
  })

  it('ignora seleção fora da lista', () => {
    expect(selecionar(tres, 9)).toBe(tres)
    expect(selecionar(tres, 2).ativa).toBe(2)
  })

  it('ao remover uma PO anterior, continua na mesma PO', () => {
    const l = remover({ ...tres, ativa: 2 }, 0)
    expect(poAtiva(l).titulo).toBe('C')
  })

  it('ao remover a PO ativa, seleciona a vizinha', () => {
    expect(poAtiva(remover(tres, 1)).titulo).toBe('C')
    expect(poAtiva(remover({ ...tres, ativa: 2 }, 2)).titulo).toBe('B')
  })

  it('nunca fica sem nenhuma PO', () => {
    const l = remover({ demandas: [po('A')], ativa: 0 }, 0)
    expect(l.demandas).toHaveLength(1)
    expect(l.ativa).toBe(0)
  })
})
