import type { FichaPO } from '../dominio/tipos'
import { decimal, minutos, percentual } from '../formato'

// Quadro com o tempo total da peça e quanto dele é máquina e quanto é manual
export function ResumoTempos({ ficha }: { ficha: FichaPO }) {
  const parteFixa = percentual(ficha.tempoFixo, ficha.tempoTotal)

  return (
    <div className="resumo">
      <span className="resumo-rotulo">Tempo total por peça</span>
      <div className="resumo-total num">
        {minutos(ficha.tempoTotal)} <small>min</small>
      </div>

      <div className="divisao" aria-hidden>
        <i style={{ width: `${parteFixa}%` }} />
      </div>
      <dl>
        <div>
          <dt>
            <i className="cor-fixo" /> Costura (máquina)
          </dt>
          <dd className="num">{minutos(ficha.tempoFixo)}</dd>
        </div>
        <div>
          <dt>
            <i className="cor-manual" /> Movimentos manuais
          </dt>
          <dd className="num">{minutos(ficha.tempoManual)}</dd>
        </div>
        <div className="resumo-producao">
          <dt>Produção estimada</dt>
          <dd className="num">{decimal(ficha.pecasPorHora, 1)} peças/h</dd>
        </div>
      </dl>
    </div>
  )
}
