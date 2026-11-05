export function minutos(valor: number, casas = 4) {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })
}

export function decimal(valor: number, casas = 1) {
  return minutos(valor, casas)
}

export function inteiro(valor: number) {
  return Math.round(valor).toLocaleString('pt-BR')
}

export function percentual(parte: number, total: number) {
  return total > 0 ? (parte / total) * 100 : 0
}
