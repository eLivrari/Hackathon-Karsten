import { useState } from 'react'
import type { ElementoMTM, PassoRoteiro } from '../dominio/tipos'
import { minutos } from '../formato'

interface Props {
  roteiro: PassoRoteiro[]
  elementos: ElementoMTM[]
  onChange: (roteiro: PassoRoteiro[]) => void
}

export function Roteiro({ roteiro, elementos, onChange }: Props) {
  const [arrastado, setArrastado] = useState<number | null>(null)
  const [alvo, setAlvo] = useState<number | null>(null)

  const elemento = (codigo: string) => elementos.find((e) => e.codigo === codigo)

  function mover(de: number, para: number) {
    if (para < 0 || para >= roteiro.length || de === para) return
    const novo = [...roteiro]
    const [passo] = novo.splice(de, 1)
    novo.splice(para, 0, passo)
    onChange(novo)
  }

  function alterarFrequencia(indice: number, frequencia: number) {
    onChange(roteiro.map((p, i) => (i === indice ? { ...p, frequencia: Math.max(1, Math.round(frequencia) || 1) } : p)))
  }

  function soltar(indice: number) {
    if (arrastado !== null) mover(arrastado, indice)
    setArrastado(null)
    setAlvo(null)
  }

  return (
    <div className="roteiro">
      <ol className="passos">
        <li className="passo fixo">
          <span />
          <span className="passo-codigo num">Fixo</span>
          <span className="passo-desc">Tempo de costura (máquina)</span>
        </li>

        {roteiro.map((passo, i) => {
          const cadastrado = elemento(passo.codigo)
          const classes = ['passo', arrastado === i && 'arrastando', alvo === i && 'alvo', !cadastrado && 'erro']
          return (
            <li
              key={`${passo.codigo}-${i}`}
              className={classes.filter(Boolean).join(' ')}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move'
                setArrastado(i)
              }}
              onDragEnd={() => {
                setArrastado(null)
                setAlvo(null)
              }}
              onDragOver={(e) => {
                e.preventDefault()
                setAlvo(i)
              }}
              onDrop={(e) => {
                e.preventDefault()
                soltar(i)
              }}
            >
              <span className="passo-alca" aria-hidden title="Arraste para reordenar">
                ⠿
              </span>
              <span className="passo-codigo num">{passo.codigo}</span>
              <span className="passo-desc">
                {cadastrado?.descricao ?? <span className="falta">código não cadastrado</span>}
              </span>
              <label className="passo-freq" title="Frequência">
                ×
                <input
                  type="number"
                  min={1}
                  value={passo.frequencia}
                  aria-label={`Frequência do elemento ${passo.codigo}`}
                  onChange={(e) => alterarFrequencia(i, Number(e.target.value))}
                />
              </label>
              <span className="passo-acoes">
                <button type="button" aria-label="Subir" disabled={i === 0} onClick={() => mover(i, i - 1)}>
                  ↑
                </button>
                <button
                  type="button"
                  aria-label="Descer"
                  disabled={i === roteiro.length - 1}
                  onClick={() => mover(i, i + 1)}
                >
                  ↓
                </button>
                <button
                  type="button"
                  aria-label={`Remover ${passo.codigo}`}
                  onClick={() => onChange(roteiro.filter((_, j) => j !== i))}
                >
                  ✕
                </button>
              </span>
            </li>
          )
        })}
      </ol>

      <p className="dica">Clique para adicionar. Arraste para mudar a ordem.</p>
      <div className="paleta">
        {elementos.map((e) => (
          <button
            key={e.codigo}
            type="button"
            className="chip"
            title={e.descricao}
            onClick={() => onChange([...roteiro, { codigo: e.codigo, frequencia: 1 }])}
          >
            <b className="num">{e.codigo}</b>
            <span>{e.descricao}</span>
            <em className="num">{minutos(e.tempo, 2)}</em>
          </button>
        ))}
      </div>
    </div>
  )
}
