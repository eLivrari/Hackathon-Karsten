import { useEffect, useState } from 'react'
import type { PassoRoteiro } from '../dominio/tipos'
import { lerRoteiro } from '../ingestao/texto'

interface CampoTextoProps {
  label: string
  value: string
  onChange: (valor: string) => void
}

export function CampoTexto({ label, value, onChange }: CampoTextoProps) {
  return (
    <label className="field">
      <span>{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}

interface CampoNumeroProps {
  label: string
  sufixo: string
  value: number
  onChange: (valor: number) => void
}

export function CampoNumero({ label, sufixo, value, onChange }: CampoNumeroProps) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="input-suffix">
        <input type="number" min="0" step="0.01" value={value} onChange={(e) => onChange(Number(e.target.value))} />
        <i>{sufixo}</i>
      </div>
    </label>
  )
}

export function roteiroComoTexto(roteiro: PassoRoteiro[]) {
  return roteiro.map((p) => (p.frequencia === 1 ? p.codigo : `${p.codigo} x${p.frequencia}`)).join(', ')
}

interface CampoRoteiroProps {
  roteiro: PassoRoteiro[]
  onChange: (roteiro: PassoRoteiro[]) => void
  onConsultarElementos: () => void
}

/**
 * O texto digitado fica em estado local: se ele fosse recalculado a partir do
 * roteiro a cada tecla, um código ainda incompleto ("2.1, 1") sumiria na hora.
 */
export function CampoRoteiro({ roteiro, onChange, onConsultarElementos }: CampoRoteiroProps) {
  const [texto, setTexto] = useState(() => roteiroComoTexto(roteiro))

  // Quando o roteiro muda por fora (importação, nova operação), atualiza o texto
  useEffect(() => {
    setTexto((atual) =>
      roteiroComoTexto(lerRoteiro(atual)) === roteiroComoTexto(roteiro) ? atual : roteiroComoTexto(roteiro),
    )
  }, [roteiro])

  return (
    <label className="field route-field">
      <span>
        Sequência de elementos MTM <i>Ordem de execução</i>
      </span>
      <input
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value)
          onChange(lerRoteiro(e.target.value))
        }}
        onBlur={() => setTexto(roteiroComoTexto(roteiro))}
        placeholder="Ex.: 2.1, 1.1, 3.1 x2"
      />
      <small className="field-hint">
        Separe os códigos por vírgula. Use x2 para indicar frequência.{' '}
        <button type="button" className="text-button" onClick={onConsultarElementos}>
          Consultar elementos disponíveis →
        </button>
      </small>
    </label>
  )
}
