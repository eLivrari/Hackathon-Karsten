import type { ReactNode } from 'react'
import type { Demanda } from '../dominio/tipos'

interface Props {
  titulo: string
  descricao: string
  demandas?: Demanda[]
  ativa?: number
  onSelecionarPO?: (indice: number) => void
  acoes?: ReactNode
}

export function CabecalhoPagina({ titulo, descricao, demandas, ativa = 0, onSelecionarPO, acoes }: Props) {
  return (
    <div className="cabecalho">
      <div>
        <h1>{titulo}</h1>
        <p>{descricao}</p>
      </div>
      <div className="cabecalho-acoes">
        {demandas && demandas.length > 1 && onSelecionarPO ? (
          <label className="seletor-po">
            <span>PO</span>
            <select value={ativa} onChange={(e) => onSelecionarPO(Number(e.target.value))}>
              {demandas.map((d, i) => (
                <option key={i} value={i}>
                  {d.titulo || 'PO sem título'} · rev. {d.revisao || '00'}
                </option>
              ))}
            </select>
          </label>
        ) : (
          demandas && (
            <span className="po-atual">
              {demandas[ativa]?.titulo || 'PO sem título'} · rev. {demandas[ativa]?.revisao || '00'}
            </span>
          )
        )}
        {acoes}
      </div>
    </div>
  )
}
