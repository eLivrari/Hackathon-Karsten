import { useState } from 'react'
import type { DragEvent } from 'react'

interface Props {
  arquivo: string
  onSelecionarArquivo: () => void
  onSoltarArquivo: (arquivo?: File) => void
  onLerTexto: (texto: string) => void
}

const EXEMPLO_TEXTO = 'Título: PO-SL-001\nPerímetro: 6,96\nCód. Eqp: 1\nElementos: 2.1, 1.1, 3.1'

export function EntradaDados({ arquivo, onSelecionarArquivo, onSoltarArquivo, onLerTexto }: Props) {
  const [arrastando, setArrastando] = useState(false)
  const [textoColado, setTextoColado] = useState('')

  function soltar(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setArrastando(false)
    onSoltarArquivo(e.dataTransfer.files?.[0])
  }

  return (
    <section className="bloco">
      <h2>Importar</h2>
      <div
        className={arrastando ? 'soltar arrastando' : 'soltar'}
        onDragOver={(e) => {
          e.preventDefault()
          setArrastando(true)
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={soltar}
      >
        <button className="botao" onClick={onSelecionarArquivo}>
          Escolher arquivo
        </button>
        <span>ou arraste para cá. Aceita ods, xlsx, xls, txt, csv e json, com a demanda ou com os cadastros.</span>
        {arquivo && <span className="arquivo-lido">Último arquivo: {arquivo}</span>}
      </div>

      <details className="colar">
        <summary>Colar dados em texto</summary>
        <p>Uma informação por linha no formato chave: valor, ou um JSON.</p>
        <textarea value={textoColado} onChange={(e) => setTextoColado(e.target.value)} placeholder={EXEMPLO_TEXTO} />
        <button className="botao" onClick={() => onLerTexto(textoColado)}>
          Ler texto
        </button>
      </details>
    </section>
  )
}
