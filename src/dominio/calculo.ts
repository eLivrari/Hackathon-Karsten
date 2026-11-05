import type { Cadastros, Demanda, FichaPO, LinhaPO } from './tipos'

// O gabarito mostra o RPM com uma folga de 10% pra baixo e pra cima.
// Se um dia essa faixa mudar, é só mexer aqui.
const FAIXA_RPM = 0.1

export function arredondar(valor: number, casas = 4) {
  const fator = 10 ** casas
  return Math.round((valor + Number.EPSILON) * fator) / fator
}

/**
 * O tempo fixo é o tempo que a máquina passa costurando de fato.
 * A conta é simples: metros de costura × minutos que a máquina gasta por metro.
 */
export function calcularTempoFixo(perimetro: number, tempoPorMetro: number) {
  return perimetro * tempoPorMetro
}

export function gerarFicha(demanda: Demanda, cadastros: Cadastros): FichaPO {
  const avisos: string[] = []
  const maquina = cadastros.maquinas.find((m) => m.codigo === demanda.codigoMaquina)

  if (!maquina) {
    avisos.push(`Máquina "${demanda.codigoMaquina}" não existe no cadastro TEMPO-CM.`)
  }

  // Sem máquina não tem como saber o tempo de costura, então fica zero (e o aviso acima explica o porquê).
  const tempoFixo = maquina ? calcularTempoFixo(demanda.perimetro, maquina.tempoPorMetro) : 0

  const linhaFixo: LinhaPO = {
    codigo: 'FIXO',
    descricao: 'Tempo de costura',
    frequencia: 1,
    tempo: tempoFixo,
    origem: 'fixo',
    encontrado: Boolean(maquina),
  }

  // Agora os movimentos manuais do operador. Se algum código não existir na matriz,
  // a linha continua aparecendo pra ninguém achar que ela sumiu.
  const linhasManuais: LinhaPO[] = demanda.roteiro.map((passo) => {
    const elemento = cadastros.elementos.find((e) => e.codigo === passo.codigo)
    if (!elemento) {
      avisos.push(`Elemento MTM "${passo.codigo}" não encontrado na matriz.`)
    }
    return {
      codigo: passo.codigo,
      descricao: elemento?.descricao ?? '— não cadastrado —',
      frequencia: passo.frequencia,
      tempo: (elemento?.tempo ?? 0) * passo.frequencia,
      origem: 'mtm',
      encontrado: Boolean(elemento),
    }
  })

  const tempoManual = linhasManuais.reduce((soma, l) => soma + l.tempo, 0)
  const tempoTotal = tempoFixo + tempoManual
  const rpmPadrao = maquina?.rpm ?? 0

  return {
    demanda,
    maquina,
    rpm: {
      inferior: rpmPadrao * (1 - FAIXA_RPM),
      padrao: rpmPadrao,
      superior: rpmPadrao * (1 + FAIXA_RPM),
    },
    linhas: [linhaFixo, ...linhasManuais],
    tempoFixo,
    tempoManual,
    tempoTotal,
    pecasPorHora: tempoTotal > 0 ? 60 / tempoTotal : 0,
    avisos,
  }
}

/**
 * Simulador "e se?": pega a mesma demanda e calcula como ficaria em cada máquina
 * cadastrada. Ajuda a ver rapidinho qual máquina compensa mais.
 */
export function simularMaquinas(demanda: Demanda, cadastros: Cadastros) {
  return cadastros.maquinas.map((maquina) => {
    const ficha = gerarFicha({ ...demanda, codigoMaquina: maquina.codigo }, cadastros)
    return { maquina, tempoTotal: ficha.tempoTotal, pecasPorHora: ficha.pecasPorHora }
  })
}

/**
 * Quantos pontos a costura inteira vai ter.
 * O perímetro vem em metros, então multiplicamos por 100 pra virar cm
 * antes de multiplicar pelos pontos por cm.
 */
export function pontosNaCostura(demanda: Demanda) {
  return Math.round(demanda.perimetro * 100 * demanda.pontosPorCm)
}
