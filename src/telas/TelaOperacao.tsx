import type { Cadastros, Demanda, FichaPO } from '../dominio/tipos'
import { minutos } from '../formato'
import { CampoNumero, CampoRoteiro, CampoTexto } from '../componentes/campos'
import { EntradaDados } from '../componentes/EntradaDados'
import { ResumoTempos } from '../componentes/ResumoTempos'

interface Props {
  demanda: Demanda
  cadastros: Cadastros
  ficha: FichaPO
  arquivo: string
  onAtualizar: <K extends keyof Demanda>(campo: K, valor: Demanda[K]) => void
  onSelecionarArquivo: () => void
  onSoltarArquivo: (arquivo?: File) => void
  onLerTexto: (texto: string) => void
  onNovaOperacao: () => void
  onGerarFicha: () => void
  onConsultarCadastros: () => void
}

export function TelaOperacao(props: Props) {
  const { demanda, cadastros, ficha, onAtualizar } = props

  return (
    <div className="duas-colunas">
      <div>
        <EntradaDados
          arquivo={props.arquivo}
          onSelecionarArquivo={props.onSelecionarArquivo}
          onSoltarArquivo={props.onSoltarArquivo}
          onLerTexto={props.onLerTexto}
        />

        <section className="bloco">
          <div className="bloco-titulo">
            <h2>Produto</h2>
            <button className="link" onClick={props.onNovaOperacao}>
              Limpar e começar outra
            </button>
          </div>
          <div className="grade grade-4">
            <CampoTexto label="Título da PO" value={demanda.titulo} onChange={(v) => onAtualizar('titulo', v)} />
            <CampoTexto label="Revisão" value={demanda.revisao} onChange={(v) => onAtualizar('revisao', v)} />
            <CampoTexto
              label="Agrupamento / família"
              value={demanda.familia}
              onChange={(v) => onAtualizar('familia', v)}
            />
            <CampoTexto label="Tamanho" value={demanda.tamanho} onChange={(v) => onAtualizar('tamanho', v)} />
          </div>
          <div className="grade grade-produto">
            <CampoTexto label="Operação" value={demanda.operacao} onChange={(v) => onAtualizar('operacao', v)} />
            <CampoTexto label="Medidas da peça" value={demanda.medidas} onChange={(v) => onAtualizar('medidas', v)} />
            <CampoNumero
              label="Perímetro de costura"
              sufixo="m"
              value={demanda.perimetro}
              onChange={(v) => onAtualizar('perimetro', v)}
            />
            <CampoNumero
              label="Pontos por cm"
              sufixo="pt/cm"
              value={demanda.pontosPorCm}
              onChange={(v) => onAtualizar('pontosPorCm', v)}
            />
          </div>
        </section>

        <section className="bloco">
          <h2>Máquina e roteiro</h2>
          <label className="campo">
            <span>Máquina</span>
            <select value={demanda.codigoMaquina} onChange={(e) => onAtualizar('codigoMaquina', e.target.value)}>
              {cadastros.maquinas.map((m) => (
                <option key={m.codigo} value={m.codigo}>
                  {m.codigo} · {m.tipo} — {m.modelo}
                </option>
              ))}
            </select>
            <small className="dica num">
              {ficha.rpm.padrao.toLocaleString('pt-BR')} rpm · {minutos(ficha.maquina?.tempoPorMetro ?? 0, 4)} min por
              metro
            </small>
          </label>
          <CampoRoteiro
            roteiro={demanda.roteiro}
            onChange={(roteiro) => onAtualizar('roteiro', roteiro)}
            onConsultarElementos={props.onConsultarCadastros}
          />
        </section>
      </div>

      <aside className="lateral">
        <ResumoTempos ficha={ficha} />
        <button className="botao primario largo" onClick={props.onGerarFicha}>
          Abrir ficha PO
        </button>
      </aside>
    </div>
  )
}
