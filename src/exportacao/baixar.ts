export function baixar(conteudo: Blob, nomeArquivo: string) {
  const url = URL.createObjectURL(conteudo)
  const link = document.createElement('a')
  link.href = url
  link.download = nomeArquivo
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function baixarJson(dados: unknown, nomeArquivo: string) {
  baixar(new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' }), nomeArquivo)
}
