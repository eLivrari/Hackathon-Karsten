import type { Cadastros } from '../dominio/tipos'
import { minutos } from '../formato'

interface Props {
  cadastros: Cadastros
  onImportar: () => void
  onRestaurarPadrao: () => void
}

export function TelaCadastros({ cadastros, onImportar, onRestaurarPadrao }: Props) {
  return (
    <>
      <div className="catalog-toolbar">
        <div className="catalog-tabs">
          <span className="selected">
            Elementos MTM <b>{cadastros.elementos.length}</b>
          </span>
          <span>
            Máquinas <b>{cadastros.maquinas.length}</b>
          </span>
        </div>
        <div className="catalog-actions">
          <button className="button secondary" onClick={onRestaurarPadrao}>
            ↺ Restaurar padrão
          </button>
          <button className="button secondary" onClick={onImportar}>
            ↑ Importar planilha
          </button>
        </div>
      </div>

      <div className="catalog-grid">
        <section className="catalog-card">
          <div className="catalog-heading">
            <div>
              <span className="catalog-icon">⌁</span>
              <div>
                <b>Matriz de elementos MTM</b>
                <small>Procedimentos manuais e seus tempos padrão</small>
              </div>
            </div>
            <span className="catalog-count">{cadastros.elementos.length} ELEMENTOS</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>CÓDIGO</th>
                  <th>DESCRIÇÃO DO ELEMENTO</th>
                  <th>TEMPO UNITÁRIO</th>
                </tr>
              </thead>
              <tbody>
                {cadastros.elementos.map((elemento) => (
                  <tr key={elemento.codigo}>
                    <td>
                      <span className="code-pill">{elemento.codigo}</span>
                    </td>
                    <td>{elemento.descricao}</td>
                    <td className="numeric">
                      {minutos(elemento.tempo)} <small>min</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="catalog-card machine-catalog">
          <div className="catalog-heading">
            <div>
              <span className="catalog-icon">⚙</span>
              <div>
                <b>Cadastro de máquinas</b>
                <small>Parâmetros de costura por equipamento</small>
              </div>
            </div>
            <span className="catalog-count">{cadastros.maquinas.length} MÁQUINAS</span>
          </div>
          <div className="machine-list">
            {cadastros.maquinas.map((maquina) => (
              <div className="machine-list-item" key={maquina.codigo}>
                <span className="machine-list-icon">⚙</span>
                <div className="machine-list-copy">
                  <b>{maquina.modelo}</b>
                  <small>
                    {maquina.tipo} · Código {maquina.codigo}
                  </small>
                </div>
                <div className="machine-data">
                  <small>RPM</small>
                  <b>{maquina.rpm.toLocaleString('pt-BR')}</b>
                </div>
                <div className="machine-data">
                  <small>TEMPO / M</small>
                  <b>
                    {minutos(maquina.tempoPorMetro, 4)} <em>min</em>
                  </b>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="catalog-footnote">
        <span>i</span> Os cadastros começam com a planilha de referência do kit. Ao importar um novo arquivo, eles são
        substituídos e ficam salvos neste navegador.
      </div>
    </>
  )
}
