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
    <div className="import-grid">
      <div
        className={`upload-card ${arrastando ? 'dragging' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setArrastando(true)
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={soltar}
      >
        <div className="upload-icon">↑</div>
        <div className="upload-copy">
          <b>Importar arquivo</b>
          <p>
            Arraste aqui ou{' '}
            <button className="text-button" onClick={onSelecionarArquivo}>
              selecione do computador
            </button>
          </p>
          <small>Planilha de cadastros ou demanda · XLS, XLSX, ODS, TXT, CSV, JSON</small>
        </div>
        <button className="button secondary" onClick={onSelecionarArquivo}>
          Selecionar arquivo
        </button>
        {arquivo && (
          <div className="file-chip">
            <span>▤</span>
            {arquivo}
            <b>✓</b>
          </div>
        )}
      </div>

      <div className="paste-card">
        <div className="paste-title">
          <span className="paste-icon">⌘</span>
          <div>
            <b>Colar dados</b>
            <small>Use o formato chave: valor ou JSON</small>
          </div>
        </div>
        <textarea value={textoColado} onChange={(e) => setTextoColado(e.target.value)} placeholder={EXEMPLO_TEXTO} />
        <button className="button secondary compact" onClick={() => onLerTexto(textoColado)}>
          Ler dados <span>→</span>
        </button>
      </div>
    </div>
  )
}
