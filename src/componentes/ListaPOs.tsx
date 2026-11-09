import { gerarFicha } from '../dominio/calculo'
import type { Cadastros, Demanda } from '../dominio/tipos'
import { minutos } from '../formato'

interface Props {
  demandas: Demanda[]
  cadastros: Cadastros
  ativa: number
  onSelecionar: (indice: number) => void
  onRemover: (indice: number) => void
  onNova: () => void
  onExportarTodas: () => void
}

export function ListaPOs({ demandas, cadastros, ativa, onSelecionar, onRemover, onNova, onExportarTodas }: Props) {
  return (
    <section className="bloco">
      <div className="bloco-titulo">
        <h2>
          POs abertas <span className="contagem">{demandas.length}</span>
        </h2>
        <div className="botoes">
          <button className="botao" onClick={onNova}>
            Nova PO
          </button>
          {demandas.length > 1 && (
            <button className="botao" onClick={onExportarTodas}>
              Exportar todas em Excel
            </button>
          )}
        </div>
      </div>

      <div className="rolagem">
        <table className="lista-pos">
          <thead>
            <tr>
              <th>PO</th>
              <th>Operação</th>
              <th>Máquina</th>
              <th className="direita">TP (min)</th>
              <th aria-label="Ações" />
            </tr>
          </thead>
          <tbody>
            {demandas.map((demanda, i) => {
              const ficha = gerarFicha(demanda, cadastros)
              return (
                <tr key={i} className={i === ativa ? 'em-uso' : undefined}>
                  <td>
                    <button className="link" onClick={() => onSelecionar(i)} aria-current={i === ativa || undefined}>
                      {demanda.titulo || 'PO sem título'}
                    </button>
                  </td>
                  <td>{demanda.operacao || '—'}</td>
                  <td>{ficha.maquina ? `${ficha.maquina.tipo} ${ficha.maquina.modelo}` : '—'}</td>
                  <td className="direita num">
                    {minutos(ficha.tempoTotal)}
                    {ficha.avisos.length > 0 && (
                      <span className="falta" title={ficha.avisos.join('\n')}>
                        !
                      </span>
                    )}
                  </td>
                  <td className="direita">
                    <button
                      className="remover"
                      aria-label={`Remover ${demanda.titulo || 'PO'}`}
                      onClick={() => onRemover(i)}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
