import type { Cadastros, Demanda, FichaPO } from '../dominio/tipos'
import { minutos } from '../formato'
import { CampoNumero, CampoRoteiro, CampoTexto } from '../componentes/campos'
import { EntradaDados } from '../componentes/EntradaDados'

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
    <>
      <div className="section-label">
        <span className="step">01</span>
        <div>
          <b>Entrada de dados</b>
          <small>Importe um arquivo ou informe os dados manualmente</small>
        </div>
        <span className="optional">ENTRADA FLEXÍVEL</span>
      </div>
      <EntradaDados
        arquivo={props.arquivo}
        onSelecionarArquivo={props.onSelecionarArquivo}
        onSoltarArquivo={props.onSoltarArquivo}
        onLerTexto={props.onLerTexto}
      />

      <div className="section-label operation-label">
        <span className="step">02</span>
        <div>
          <b>Parâmetros da operação</b>
          <small>Os campos podem ser ajustados antes de gerar a ficha</small>
        </div>
        <button className="text-button reset-button" onClick={props.onNovaOperacao}>
          + Nova operação
        </button>
      </div>

      <div className="form-card">
        <div className="form-section-title">
          <span className="mini-icon">▣</span>
          <b>Identificação do produto</b>
          <span>INFORMAÇÕES GERAIS</span>
        </div>
        <div className="form-grid four">
          <CampoTexto label="Título da PO" value={demanda.titulo} onChange={(v) => onAtualizar('titulo', v)} />
          <CampoTexto label="Revisão" value={demanda.revisao} onChange={(v) => onAtualizar('revisao', v)} />
          <CampoTexto
            label="Agrupamento / família"
            value={demanda.familia}
            onChange={(v) => onAtualizar('familia', v)}
          />
          <CampoTexto label="Tamanho" value={demanda.tamanho} onChange={(v) => onAtualizar('tamanho', v)} />
        </div>
        <div className="form-grid product-grid">
          <CampoTexto label="Operação" value={demanda.operacao} onChange={(v) => onAtualizar('operacao', v)} />
          <CampoTexto label="Medidas da peça" value={demanda.medidas} onChange={(v) => onAtualizar('medidas', v)} />
          <CampoNumero
            label="Perímetro de costura"
            sufixo="m"
            value={demanda.perimetro}
            onChange={(v) => onAtualizar('perimetro', v)}
          />
          <CampoNumero
            label="Pontos por centímetro"
            sufixo="pt/cm"
            value={demanda.pontosPorCm}
            onChange={(v) => onAtualizar('pontosPorCm', v)}
          />
        </div>

        <div className="divider" />

        <div className="form-section-title">
          <span className="mini-icon machine-icon">⚙</span>
          <b>Equipamento e roteiro</b>
          <span>PROCESSO PRODUTIVO</span>
        </div>
        <div className="form-grid equipment-grid">
          <label className="field">
            <span>Máquina selecionada</span>
            <select value={demanda.codigoMaquina} onChange={(e) => onAtualizar('codigoMaquina', e.target.value)}>
              {cadastros.maquinas.map((m) => (
                <option key={m.codigo} value={m.codigo}>
                  {m.codigo} · {m.tipo} — {m.modelo}
                </option>
              ))}
            </select>
          </label>
          <div className="machine-facts">
            <span>
              <small>RPM padrão</small>
              <b>{ficha.rpm.padrao.toLocaleString('pt-BR')}</b>
            </span>
            <span>
              <small>Tempo / metro</small>
              <b>
                {minutos(ficha.maquina?.tempoPorMetro ?? 0, 4)} <em>min/m</em>
              </b>
            </span>
          </div>
        </div>
        <CampoRoteiro
          roteiro={demanda.roteiro}
          onChange={(roteiro) => onAtualizar('roteiro', roteiro)}
          onConsultarElementos={props.onConsultarCadastros}
        />

        <div className="form-footer">
          <span>
            <span className="check-icon">✓</span> Cálculo atualizado automaticamente
          </span>
          <button className="button primary" onClick={props.onGerarFicha}>
            Gerar ficha PO <span>→</span>
          </button>
        </div>
      </div>
    </>
  )
}
