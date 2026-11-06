import { pontosNaCostura } from '../dominio/calculo'
import type { FichaPO } from '../dominio/tipos'
import { decimal, minutos, percentual } from '../formato'

interface Props {
  ficha: FichaPO
  onExportar: () => void
  onEditar: () => void
  onAnalisar: () => void
}

export function TelaFicha({ ficha, onExportar, onEditar, onAnalisar }: Props) {
  return (
    <div className="content-grid">
      <div className="primary-column">
        <FichaPOCard ficha={ficha} />
        <div className="action-row">
          <button className="button secondary" onClick={onEditar}>
            ← Editar operação
          </button>
          <button className="button primary" onClick={onExportar}>
            ↓ Exportar ficha Excel
          </button>
        </div>
      </div>
      <aside className="summary-column">
        <ResumoTempos ficha={ficha} />
        <div className="info-card">
          <span className="info-icon">i</span>
          <div>
            <b>Como é calculado?</b>
            <p>
              Tempo fixo = perímetro × tempo por metro. O tempo manual soma os elementos MTM multiplicados por suas
              frequências.
            </p>
          </div>
        </div>
        <div className="mini-callout">
          <span>↗</span>
          <div>
            <b>Quer comparar equipamentos?</b>
            <button onClick={onAnalisar}>Ver análise de máquinas →</button>
          </div>
        </div>
      </aside>
    </div>
  )
}

function FichaPOCard({ ficha }: { ficha: FichaPO }) {
  const { demanda, rpm } = ficha
  return (
    <section className="po-card">
      <div className="po-top">
        <div>
          <div className="eyebrow">PROCESSO OPERACIONAL</div>
          <h2>
            {demanda.titulo || 'PO-NOVA'} <span>REV. {demanda.revisao}</span>
          </h2>
          <p>{demanda.operacao || 'Operação sem descrição'}</p>
        </div>
        <span className="approved">
          <i /> PRONTA PARA REVISÃO
        </span>
      </div>

      <div className="po-meta">
        <div>
          <small>AGRUPAMENTO / FAMÍLIA</small>
          <b>{demanda.familia || '—'}</b>
        </div>
        <div>
          <small>TAMANHO</small>
          <b>{demanda.tamanho || '—'}</b>
        </div>
        <div>
          <small>MEDIDAS DA PEÇA</small>
          <b>{demanda.medidas || '—'}</b>
        </div>
        <div>
          <small>PERÍMETRO DE COSTURA</small>
          <b>
            {decimal(demanda.perimetro, 2)} <em>m</em>
          </b>
        </div>
      </div>

      <div className="machine-strip">
        <span className="machine-badge">⚙</span>
        <div>
          <small>EQUIPAMENTO</small>
          <b>{ficha.maquina ? `${ficha.maquina.tipo} · ${ficha.maquina.modelo}` : 'Máquina não cadastrada'}</b>
        </div>
        <div>
          <small>CÓDIGO</small>
          <b>{demanda.codigoMaquina}</b>
        </div>
        <div>
          <small>RPM · PADRÃO</small>
          <b>{rpm.padrao.toLocaleString('pt-BR')}</b>
        </div>
        <div>
          <small>FAIXA DE RPM</small>
          <b>
            {rpm.inferior.toLocaleString('pt-BR')} — {rpm.superior.toLocaleString('pt-BR')}
          </b>
        </div>
      </div>

      <div className="table-heading">
        <div>
          <b>Elementos da operação</b>
          <small>Tempos unitários em minutos</small>
        </div>
        <span>{ficha.linhas.length} ETAPAS</span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>CÓDIGO</th>
              <th>ELEMENTO / DESCRIÇÃO</th>
              <th>FREQUÊNCIA</th>
              <th>TEMPO (MIN)</th>
            </tr>
          </thead>
          <tbody>
            {ficha.linhas.map((linha, i) => (
              <tr key={`${linha.codigo}-${i}`}>
                <td>
                  <span className={`code-pill ${linha.origem === 'fixo' ? 'fixed' : ''}`}>{linha.codigo}</span>
                </td>
                <td>
                  {linha.descricao}
                  {!linha.encontrado && <small className="missing">Não cadastrado</small>}
                </td>
                <td>{linha.frequencia.toLocaleString('pt-BR')}</td>
                <td className="numeric">{minutos(linha.tempo)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3}>
                <b>TP</b> Tempo total da operação
              </td>
              <td className="numeric">{minutos(ficha.tempoTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="po-bottom">
        <span>
          Pontos estimados na costura{' '}
          <b>
            {pontosNaCostura(demanda).toLocaleString('pt-BR')} <small>pts</small>
          </b>
        </span>
        <span>
          Produção estimada{' '}
          <b>
            {decimal(ficha.pecasPorHora, 1)} <small>peças/h</small>
          </b>
        </span>
      </div>

      {ficha.avisos.length > 0 && (
        <div className="warning-box">
          <b>Confira os cadastros</b>
          {ficha.avisos.map((aviso) => (
            <span key={aviso}>{aviso}</span>
          ))}
        </div>
      )}
    </section>
  )
}

function ResumoTempos({ ficha }: { ficha: FichaPO }) {
  return (
    <div className="summary-card">
      <div className="summary-label">TEMPO TOTAL</div>
      <div className="big-metric">
        {minutos(ficha.tempoTotal)}
        <small>min</small>
      </div>
      <div className="metric-caption">por peça produzida</div>
      <div className="metric-divider" />
      <div className="metric-row">
        <span>Costura da máquina</span>
        <b>{minutos(ficha.tempoFixo)} min</b>
      </div>
      <div className="metric-row">
        <span>Movimentos manuais</span>
        <b>{minutos(ficha.tempoManual)} min</b>
      </div>
      <div className="stacked-bar">
        <i style={{ width: `${percentual(ficha.tempoFixo, ficha.tempoTotal)}%` }} />
        <b style={{ width: `${percentual(ficha.tempoManual, ficha.tempoTotal)}%` }} />
      </div>
      <div className="legend">
        <span>
          <i className="legend-fixed" /> Fixo
        </span>
        <span>
          <i className="legend-manual" /> MTM
        </span>
      </div>
    </div>
  )
}
