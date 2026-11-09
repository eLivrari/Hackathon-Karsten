import type { simularMaquinas } from '../dominio/calculo'
import type { FichaPO } from '../dominio/tipos'
import { decimal, minutos } from '../formato'

type Comparativo = ReturnType<typeof simularMaquinas>

interface Props {
  comparativo: Comparativo
  ficha: FichaPO
  onTrocarMaquina: (codigo: string) => void
}

export function TelaAnalise({ comparativo, ficha, onTrocarMaquina }: Props) {
  const { demanda } = ficha
  const maisRapida = comparativo.length ? Math.min(...comparativo.map((m) => m.tempoTotal)) : 0
  const maisLenta = Math.max(...comparativo.map((m) => m.tempoTotal), 0.01)
  const emUso = comparativo.find((r) => r.maquina.codigo === demanda.codigoMaquina)

  return (
    <section className="bloco">
      <p className="contexto">
        {demanda.titulo || 'PO sem título'} · {decimal(demanda.perimetro, 2)} m de costura · {ficha.linhas.length - 1}{' '}
        elementos MTM
      </p>

      <div className="rolagem">
        <table>
          <thead>
            <tr>
              <th>Máquina</th>
              <th className="direita">RPM</th>
              <th className="direita">Costura (min)</th>
              <th className="direita">Total (min)</th>
              <th className="direita">Peças/h</th>
              <th className="direita">Diferença</th>
              <th className="coluna-barra" aria-hidden />
              <th aria-label="Ações" />
            </tr>
          </thead>
          <tbody>
            {comparativo.map(({ maquina, tempoTotal, pecasPorHora }) => {
              const diferenca = emUso ? pecasPorHora - emUso.pecasPorHora : 0
              return (
                <tr key={maquina.codigo} className={maquina.codigo === demanda.codigoMaquina ? 'em-uso' : undefined}>
                  <td>
                    <b>{maquina.modelo}</b>
                    <span className="sub">
                      {maquina.tipo} · cód. {maquina.codigo}
                    </span>
                    {maquina.codigo === demanda.codigoMaquina && <span className="etiqueta">em uso</span>}
                    {tempoTotal === maisRapida && <span className="etiqueta ok">mais rápida</span>}
                  </td>
                  <td className="direita num">{maquina.rpm.toLocaleString('pt-BR')}</td>
                  <td className="direita num">{minutos(demanda.perimetro * maquina.tempoPorMetro)}</td>
                  <td className="direita num">{minutos(tempoTotal)}</td>
                  <td className="direita num">{decimal(pecasPorHora, 1)}</td>
                  <td className="direita num">
                    {Math.abs(diferenca) < 0.05 ? '—' : `${diferenca > 0 ? '+' : ''}${decimal(diferenca, 1)}`}
                  </td>
                  <td className="coluna-barra">
                    <div className="barra">
                      <i style={{ width: `${(tempoTotal / maisLenta) * 100}%` }} />
                    </div>
                  </td>
                  <td className="direita">
                    {maquina.codigo !== demanda.codigoMaquina && (
                      <button className="link" onClick={() => onTrocarMaquina(maquina.codigo)}>
                        Usar esta
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="nota">
        Só o tempo de costura muda entre as máquinas. Diferença = peças/h a mais ou a menos que a máquina em uso.
      </p>
    </section>
  )
}
