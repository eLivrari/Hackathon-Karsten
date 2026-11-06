import { useEffect, useState } from 'react'

export type Tema = 'claro' | 'escuro'

// A mesma chave é lida no index.html antes do React carregar, pra tela não piscar
const CHAVE = 'auto-tm-karsten:tema'

function temaInicial(): Tema {
  try {
    const salvo = localStorage.getItem(CHAVE)
    if (salvo === 'claro' || salvo === 'escuro') return salvo
  } catch {
    // armazenamento bloqueado: cai no tema do sistema
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro'
}

export function useTema() {
  const [tema, setTema] = useState<Tema>(temaInicial)

  useEffect(() => {
    document.documentElement.dataset.tema = tema
    try {
      localStorage.setItem(CHAVE, tema)
    } catch {
      // sem armazenamento o tema só não é lembrado
    }
  }, [tema])

  const alternar = () => setTema((atual) => (atual === 'claro' ? 'escuro' : 'claro'))
  return { tema, alternar }
}
