import type { Cadastros, Demanda } from '../dominio/tipos'

// Tudo o que o usuário edita fica guardado no localStorage do navegador,
// então um F5 ou fechar a aba não perde o trabalho.
// A versão na chave permite mudar o formato no futuro sem quebrar dados antigos.
const CHAVE = 'auto-tm-karsten:v1'

export interface EstadoSalvo {
  cadastros: Cadastros
  demanda: Demanda
}

function pareceCadastros(valor: unknown): valor is Cadastros {
  const c = valor as Cadastros
  return Boolean(c) && Array.isArray(c.elementos) && Array.isArray(c.maquinas)
}

function pareceDemanda(valor: unknown): valor is Demanda {
  const d = valor as Demanda
  return Boolean(d) && typeof d.titulo === 'string' && typeof d.perimetro === 'number' && Array.isArray(d.roteiro)
}

/** Devolve só as partes válidas do que estava salvo (vazio se não houver nada). */
export function carregarEstado(): Partial<EstadoSalvo> {
  try {
    const bruto = localStorage.getItem(CHAVE)
    if (!bruto) return {}
    const dados = JSON.parse(bruto) as Partial<EstadoSalvo>
    return {
      cadastros: pareceCadastros(dados.cadastros) ? dados.cadastros : undefined,
      demanda: pareceDemanda(dados.demanda) ? dados.demanda : undefined,
    }
  } catch {
    // JSON corrompido ou armazenamento bloqueado (aba anônima, por exemplo)
    return {}
  }
}

/** Retorna true se conseguiu salvar. */
export function salvarEstado(estado: EstadoSalvo): boolean {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado))
    return true
  } catch {
    return false
  }
}

export function limparEstado() {
  try {
    localStorage.removeItem(CHAVE)
  } catch {
    // nada a fazer: se não dá pra ler, também não havia nada salvo
  }
}
