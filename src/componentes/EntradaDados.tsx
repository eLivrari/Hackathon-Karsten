import { useState } from 'react'
import type { DragEvent } from 'react'

interface Props {
  resumoImportacao: string[]
  onSelecionarArquivos: () => void
  onSoltarArquivos: (arquivos: File[]) => void
  onLerTexto: (texto: string) => void
  onCarregarExemplo: () => void
}

const EXEMPLO_TEXTO = 'Título: PO-SL-001\nPerímetro: 6,96\nCód. Eqp: 1\nElementos: 2.1, 1.1, 3.1'

export function EntradaDados(props: Props) {
  const [arrastando, setArrastando] = useState(false)
  const [textoColado, setTextoColado] = useState('')

  function soltar(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setArrastando(false)
    props.onSoltarArquivos([...e.dataTransfer.files])
  }

  return (
    <section className="bloco">
      <div className="bloco-titulo">
        <h2>Importar</h2>
        <button className="link" onClick={props.onCarregarExemplo}>
          Abrir exemplo PO-SL-001
        </button>
      </div>
      <div
        className={arrastando ? 'soltar arrastando' : 'soltar'}
        onDragOver={(e) => {
          e.preventDefault()
          setArrastando(true)
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={soltar}
      >
        <button className="botao" onClick={props.onSelecionarArquivos}>
          Escolher arquivos
        </button>
        <span>ou arraste para cá (pode ser mais de um). Aceita ods, xlsx, xls, txt, csv e json.</span>
        {props.resumoImportacao.length > 0 && (
          <ul className="arquivos-lidos">
            {props.resumoImportacao.map((linha, i) => (
              <li key={i}>{linha}</li>
            ))}
          </ul>
        )}
      </div>

      <details className="colar">
        <summary>Colar dados em texto</summary>
        <p>Uma informação por linha (chave: valor) ou JSON.</p>
        <textarea value={textoColado} onChange={(e) => setTextoColado(e.target.value)} placeholder={EXEMPLO_TEXTO} />
        <button
          className="botao"
          onClick={() => {
            props.onLerTexto(textoColado)
            setTextoColado('')
          }}
        >
          Ler texto
        </button>
      </details>
    </section>
  )
}
