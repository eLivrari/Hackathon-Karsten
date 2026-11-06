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
      <div className="acoes topo-cadastros">
        <p className="nota">
          Começa com a planilha de referência do kit. Importar um arquivo substitui os cadastros e fica salvo neste
          navegador.
        </p>
        <div>
          <button className="botao" onClick={onRestaurarPadrao}>
            Restaurar padrão do kit
          </button>
          <button className="botao" onClick={onImportar}>
            Importar planilha
          </button>
        </div>
      </div>

      <div className="cadastros">
        <section className="bloco">
          <h2>
            Elementos MTM <span className="contagem">{cadastros.elementos.length}</span>
          </h2>
          <div className="rolagem">
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Descrição</th>
                  <th className="direita">Tempo (min)</th>
                </tr>
              </thead>
              <tbody>
                {cadastros.elementos.map((elemento) => (
                  <tr key={elemento.codigo}>
                    <td className="num">{elemento.codigo}</td>
                    <td>{elemento.descricao}</td>
                    <td className="direita num">{minutos(elemento.tempo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bloco">
          <h2>
            Máquinas <span className="contagem">{cadastros.maquinas.length}</span>
          </h2>
          <div className="rolagem">
            <table>
              <thead>
                <tr>
                  <th>Cód.</th>
                  <th>Máquina</th>
                  <th className="direita">RPM</th>
                  <th className="direita">Min/metro</th>
                </tr>
              </thead>
              <tbody>
                {cadastros.maquinas.map((maquina) => (
                  <tr key={maquina.codigo}>
                    <td className="num">{maquina.codigo}</td>
                    <td>
                      {maquina.modelo}
                      <span className="sub">{maquina.tipo}</span>
                    </td>
                    <td className="direita num">{maquina.rpm.toLocaleString('pt-BR')}</td>
                    <td className="direita num">{minutos(maquina.tempoPorMetro, 4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  )
}
