import { describe, expect, it } from 'vitest'
import { arredondar, calcularTempoFixo, gerarFicha, simularMaquinas } from './calculo'
import { CADASTRO_PADRAO, DEMANDA_EXEMPLO } from './cadastroPadrao'

// numeros tirados da planilha PO-SL-000.ods

describe('calculo', () => {
  it('tempo fixo', () => {
    expect(arredondar(calcularTempoFixo(6.96, 0.0964))).toBe(0.6709)
  })

  it('ficha PO-SL-001', () => {
    const ficha = gerarFicha(DEMANDA_EXEMPLO, CADASTRO_PADRAO)

    expect(ficha.linhas.map((l) => l.codigo)).toEqual(['FIXO', '2.1', '1.1', '3.1'])
    expect(ficha.linhas.map((l) => arredondar(l.tempo))).toEqual([0.6709, 0.15, 0, 0.12])
    expect(arredondar(ficha.tempoTotal)).toBe(0.9409)
    expect(ficha.rpm).toEqual({ inferior: 4500, padrao: 5000, superior: 5500 })
    expect(ficha.maquina?.tipo).toBe('Interlock')
    expect(ficha.avisos).toHaveLength(0)
  })

  it('frequencia multiplica o tempo', () => {
    const ficha = gerarFicha({ ...DEMANDA_EXEMPLO, roteiro: [{ codigo: '2.1', frequencia: 3 }] }, CADASTRO_PADRAO)
    expect(arredondar(ficha.tempoManual)).toBe(0.45)
  })

  it('codigo invalido gera aviso', () => {
    const ficha = gerarFicha(
      { ...DEMANDA_EXEMPLO, codigoMaquina: '9', roteiro: [{ codigo: '7.7', frequencia: 1 }] },
      CADASTRO_PADRAO,
    )
    expect(ficha.tempoTotal).toBe(0)
    expect(ficha.avisos).toHaveLength(2) // maquina + elemento
  })

  it('simular maquinas', () => {
    const res = simularMaquinas(DEMANDA_EXEMPLO, CADASTRO_PADRAO)
    expect(res).toHaveLength(3)

    const tempos = res.map((r) => r.tempoTotal)
    const maisRapida = res[tempos.indexOf(Math.min(...tempos))]
    expect(maisRapida.maquina.modelo).toBe('Siruba')
  })
})
