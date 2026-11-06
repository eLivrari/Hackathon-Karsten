import type { simularMaquinas } from '../dominio/calculo'
import type { FichaPO } from '../dominio/tipos'
import { decimal, minutos } from '../formato'

type Comparativo = ReturnType<typeof simularMaquinas>

interface Props {
  comparativo: Comparativo
  ficha: FichaPO
}

export function TelaAnalise({ comparativo, ficha }: Props) {
  const maisRapida = comparativo.length ? Math.min(...comparativo.map((m) => m.tempoTotal)) : 0
  const maisLenta = Math.max(...comparativo.map((m) => m.tempoTotal), 0.01)

  return (
    <>
      <div className="analysis-summary">
        <div className="analysis-summary-icon">↗</div>
        <div>
          <b>Simulação por equipamento</b>
          <p>Mesmo produto e roteiro, calculados com o tempo por metro de cada máquina cadastrada.</p>
        </div>
        <div className="analysis-kpi">
          <small>ROTEIRO ANALISADO</small>
          <b>
            {ficha.linhas.length - 1} <em>elementos MTM</em>
          </b>
        </div>
        <div className="analysis-kpi">
          <small>PERÍMETRO</small>
          <b>
            {decimal(ficha.demanda.perimetro, 2)} <em>m</em>
          </b>
        </div>
      </div>

      <div className="analysis-grid">
        {comparativo.map((resultado) => (
          <CartaoMaquina
            key={resultado.maquina.codigo}
            resultado={resultado}
            perimetro={ficha.demanda.perimetro}
            maisRapida={resultado.tempoTotal === maisRapida}
            larguraBarra={(resultado.tempoTotal / maisLenta) * 100}
          />
        ))}
      </div>

      <div className="analysis-note">
        <span>i</span>
        <p>
          A simulação considera o tempo de costura fixo de cada máquina e mantém iguais os tempos dos movimentos
          manuais. A produção é uma estimativa matemática por hora.
        </p>
      </div>
    </>
  )
}

interface CartaoMaquinaProps {
  resultado: Comparativo[number]
  perimetro: number
  maisRapida: boolean
  larguraBarra: number
}

function CartaoMaquina({ resultado, perimetro, maisRapida, larguraBarra }: CartaoMaquinaProps) {
  const { maquina, tempoTotal, pecasPorHora } = resultado
  return (
    <article className={`machine-card ${maisRapida ? 'best' : ''}`}>
      <div className="machine-card-top">
        <div className="machine-symbol">⚙</div>
        {maisRapida && <span className="best-tag">MAIS RÁPIDA</span>}
      </div>
      <div className="machine-kind">
        {maquina.tipo} · CÓD. {maquina.codigo}
      </div>
      <h2>{maquina.modelo}</h2>
      <div className="machine-rpm">
        <span>RPM padrão</span>
        <b>{maquina.rpm.toLocaleString('pt-BR')}</b>
      </div>
      <div className="machine-result">
        <small>TEMPO TOTAL / PEÇA</small>
        <b>
          {minutos(tempoTotal)} <em>min</em>
        </b>
        <div className="bar-track">
          <i style={{ width: `${larguraBarra}%` }} />
        </div>
      </div>
      <div className="machine-result production">
        <small>PRODUÇÃO ESTIMADA</small>
        <b>
          {decimal(pecasPorHora, 1)} <em>peças/h</em>
        </b>
      </div>
      <div className="machine-foot">
        <span>Tempo de costura</span>
        <b>{minutos(perimetro * maquina.tempoPorMetro)} min</b>
      </div>
    </article>
  )
}
