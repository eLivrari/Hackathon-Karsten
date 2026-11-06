import { beforeEach, describe, expect, it } from 'vitest'
import { CADASTRO_PADRAO, DEMANDA_EXEMPLO } from '../dominio/cadastroPadrao'
import { carregarEstado, limparEstado, salvarEstado } from './armazenamento'

// O vitest roda em Node, então simulamos o localStorage do navegador
function criarStorageFalso(): Storage {
  const dados = new Map<string, string>()
  return {
    get length() {
      return dados.size
    },
    clear: () => dados.clear(),
    getItem: (k) => dados.get(k) ?? null,
    key: (i) => [...dados.keys()][i] ?? null,
    removeItem: (k) => void dados.delete(k),
    setItem: (k, v) => void dados.set(k, String(v)),
  }
}

describe('persistência no navegador', () => {
  beforeEach(() => {
    globalThis.localStorage = criarStorageFalso()
  })

  it('devolve vazio quando não há nada salvo', () => {
    expect(carregarEstado()).toEqual({})
  })

  it('recupera exatamente o que foi salvo', () => {
    const demanda = { ...DEMANDA_EXEMPLO, titulo: 'PO-TESTE', perimetro: 3.5 }
    expect(salvarEstado({ cadastros: CADASTRO_PADRAO, demanda })).toBe(true)
    expect(carregarEstado()).toEqual({ cadastros: CADASTRO_PADRAO, demanda })
  })

  it('ignora dados corrompidos sem quebrar', () => {
    localStorage.setItem('auto-tm-karsten:v1', '{isso não é json')
    expect(carregarEstado()).toEqual({})
  })

  it('limpa o que estava salvo', () => {
    salvarEstado({ cadastros: CADASTRO_PADRAO, demanda: DEMANDA_EXEMPLO })
    limparEstado()
    expect(carregarEstado()).toEqual({})
  })
})
