import type { Cadastros, ElementoMTM, Maquina } from '../dominio/tipos'

interface Props {
  cadastros: Cadastros
  onChange: (cadastros: Cadastros) => void
  onImportar: () => void
  onRestaurarPadrao: () => void
}

export function TelaCadastros({ cadastros, onChange, onImportar, onRestaurarPadrao }: Props) {
  const { elementos, maquinas } = cadastros

  function editarElemento(i: number, mudanca: Partial<ElementoMTM>) {
    onChange({ ...cadastros, elementos: elementos.map((e, j) => (j === i ? { ...e, ...mudanca } : e)) })
  }

  function editarMaquina(i: number, mudanca: Partial<Maquina>) {
    onChange({ ...cadastros, maquinas: maquinas.map((m, j) => (j === i ? { ...m, ...mudanca } : m)) })
  }

  function novaMaquina(): Maquina {
    const maiorCodigo = Math.max(0, ...maquinas.map((m) => Number(m.codigo) || 0))
    return { codigo: String(maiorCodigo + 1), tipo: '', modelo: '', rpm: 5000, tempoPorMetro: 0 }
  }

  const elementosRepetidos = repetidos(elementos.map((e) => e.codigo))
  const maquinasRepetidas = repetidos(maquinas.map((m) => m.codigo))

  return (
    <>
      <div className="acoes topo-cadastros">
        <p className="nota">Clique numa célula para editar. Importar uma planilha substitui os cadastros.</p>
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
          <div className="bloco-titulo">
            <h2>
              Elementos MTM <span className="contagem">{elementos.length}</span>
            </h2>
            <button
              className="botao"
              onClick={() =>
                onChange({ ...cadastros, elementos: [...elementos, { codigo: '', descricao: '', tempo: 0 }] })
              }
            >
              Adicionar elemento
            </button>
          </div>
          {elementosRepetidos.length > 0 && (
            <p className="alerta sem-margem">Código repetido: {elementosRepetidos.join(', ')}</p>
          )}
          <div className="rolagem">
            <table className="tabela-edicao">
              <thead>
                <tr>
                  <th className="col-codigo">Código</th>
                  <th>Descrição</th>
                  <th className="col-numero direita">Tempo (min)</th>
                  <th className="col-remover" aria-label="Ações" />
                </tr>
              </thead>
              <tbody>
                {elementos.map((elemento, i) => (
                  <tr key={i}>
                    <td>
                      <input
                        className="num"
                        value={elemento.codigo}
                        placeholder="7.1"
                        aria-label="Código"
                        onChange={(e) => editarElemento(i, { codigo: e.target.value.trim() })}
                      />
                    </td>
                    <td>
                      <input
                        value={elemento.descricao}
                        aria-label="Descrição"
                        onChange={(e) => editarElemento(i, { descricao: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        className="num direita"
                        type="number"
                        min="0"
                        step="0.01"
                        value={elemento.tempo}
                        aria-label="Tempo em minutos"
                        onChange={(e) => editarElemento(i, { tempo: Number(e.target.value) })}
                      />
                    </td>
                    <td>
                      <button
                        className="remover"
                        aria-label={`Remover elemento ${elemento.codigo}`}
                        onClick={() => onChange({ ...cadastros, elementos: elementos.filter((_, j) => j !== i) })}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bloco">
          <div className="bloco-titulo">
            <h2>
              Máquinas <span className="contagem">{maquinas.length}</span>
            </h2>
            <button
              className="botao"
              onClick={() => onChange({ ...cadastros, maquinas: [...maquinas, novaMaquina()] })}
            >
              Adicionar máquina
            </button>
          </div>
          {maquinasRepetidas.length > 0 && (
            <p className="alerta sem-margem">Código repetido: {maquinasRepetidas.join(', ')}</p>
          )}
          <div className="rolagem">
            <table className="tabela-edicao">
              <thead>
                <tr>
                  <th className="col-codigo">Cód.</th>
                  <th>Tipo</th>
                  <th>Modelo</th>
                  <th className="col-numero direita">RPM</th>
                  <th className="col-numero direita">Min/metro</th>
                  <th className="col-remover" aria-label="Ações" />
                </tr>
              </thead>
              <tbody>
                {maquinas.map((maquina, i) => (
                  <tr key={i}>
                    <td>
                      <input
                        className="num"
                        value={maquina.codigo}
                        aria-label="Código"
                        onChange={(e) => editarMaquina(i, { codigo: e.target.value.trim() })}
                      />
                    </td>
                    <td>
                      <input
                        value={maquina.tipo}
                        aria-label="Tipo"
                        onChange={(e) => editarMaquina(i, { tipo: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        value={maquina.modelo}
                        aria-label="Modelo"
                        onChange={(e) => editarMaquina(i, { modelo: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        className="num direita"
                        type="number"
                        min="0"
                        step="100"
                        value={maquina.rpm}
                        aria-label="RPM"
                        onChange={(e) => editarMaquina(i, { rpm: Number(e.target.value) })}
                      />
                    </td>
                    <td>
                      <input
                        className="num direita"
                        type="number"
                        min="0"
                        step="0.0001"
                        value={maquina.tempoPorMetro}
                        aria-label="Minutos por metro"
                        onChange={(e) => editarMaquina(i, { tempoPorMetro: Number(e.target.value) })}
                      />
                    </td>
                    <td>
                      <button
                        className="remover"
                        aria-label={`Remover máquina ${maquina.codigo}`}
                        onClick={() => onChange({ ...cadastros, maquinas: maquinas.filter((_, j) => j !== i) })}
                      >
                        ✕
                      </button>
                    </td>
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

function repetidos(codigos: string[]) {
  return [...new Set(codigos.filter((c, i) => c && codigos.indexOf(c) !== i))]
}
